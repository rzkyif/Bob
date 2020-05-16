'use strict';

// library requirements
const fs = require('fs')
const path = require('path')
const line = require('@line/bot-sdk');
const express = require('express');

// load config from environment
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
  adminPassword: process.env.ADMIN_PASSWORD
};

// constants
const pluginDirectory = 'plugins'
const client = new line.Client(config);
const app = express();
const commandPrefix = '.';

// variables
let messageHandlers = []
let commandHandlers = {}
let commandAliases = {}
let locks = {}
let adminId = ''

// callback route handler
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// module loading function definition and call
function reloadModules() {
  console.log('Reloading modules...');

  let index = 0;
  fs.readdirSync(pluginDirectory).forEach((file) => {
    let pluginPath = './' + path.join(pluginDirectory, file)
    let plugin = require(pluginPath);

    if (plugin.command !== undefined && plugin.command !== null) {
      commandHandlers[plugin.command] = plugin;
      plugin.alias.forEach((alias) => {
        commandAliases[alias] = plugin.command;
      })
    } else {
      messageHandlers.push(plugin);
    }

    delete require.cache[require.resolve(pluginPath)];
    index++;
  })

  console.log('Module reload successful!');

}

// global event handle
async function handleEvent(event) {

  // only handle text messages
  if (event.type !== 'message' || event.message.type !== 'text' ) {
    return null;
  }

  // extract event information
  let newline = event.message.text.indexOf('\n'),
      space = event.message.text.indexOf(' ');
  let input;
  if (newline === -1 || (space !== -1 && space < newline)) {
    input = event.message.text.match(/(?:[^ \n\t'`"]+|`[^`]*`|'[^']*'|"[^"]*")+/g);
  } else {
    input = event.message.text.match(/(?:[^\n\t'`"]+|`[^`]*`|'[^']*'|"[^"]*")+/g); 
  }
  const source = { 
    type: event.source.type, 
    placeId: (event.source.type === 'group' ? event.source.groupId : (event.source.type === 'room' ? event.source.roomId : null)), 
    userId: event.source.userId 
  };

  // only handle input with processable content
  if (input.length == 0) {
    return null;
  }

  // start processing
  let finalReply = [];
  if (input[0].startsWith(commandPrefix)) {
    // command handler calls
    let command, args = null;

    command = input[0].slice(commandPrefix.length).toLowerCase();
    if (input.length > 1) {
      args = input.slice(1).map((arg) => {
        return arg.replace(/(^["'`]|["'`]$)/g, '');
      });
    }

    const info = { command: command, args: args }

    let textReply = null;
    switch (command) {
      // op command
      case 'op':
        if (source.placeId || !args || args[0] !== config.adminPassword) {
          textReply = 'Wrong password!';
        } else {
          adminId = source.userId;
          textReply = 'New admin registered!';
        }
        break;

      // reload command
      case 'reload':
        if (source.placeId || source.userId !== adminId) {
          textReply = 'You are not the administrator of this bot!';
        } else {
          reloadModules();
          textReply = 'Modules reloaded!';
        }
        break;

      // help command
      case 'help':
        if (args) {
          let plugin = commandHandlers[commandAliases[args[0]] || args[0]];
          if (plugin !== undefined) {
            textReply = "Syntax:\n" + commandPrefix + plugin.syntax;
            textReply += "\n\nDescription:\n" + plugin.description;
            textReply += "\n\nAlias:\n" + plugin.alias.join(', ');
          } else {
            textReply = "Command not found!"
          }
        } else {
          textReply = "Available commands:";
          Object.keys(commandHandlers).forEach((key, index) => {
            let handler = commandHandlers[key];
            textReply += '\n'+(index+1)+': '+handler.command+' ('+handler.alias.join(', ')+')';
          });
        }
        break;

      // all other commands
      default:
        let plugin = commandHandlers[commandAliases[command] || command];
        if (plugin !== undefined) {
          if (plugin.admin && source.userId !== adminId) {
            textReply = 'You are not allowed to use this command!';
          } else {
            let {result, final, lock} = await plugin.handle(info, source);
            if (result !== undefined) {
              if (Array.isArray(result)) {
                result.forEach((reply) => {
                  if (reply.text && reply.text.length > 3000) reply.text = reply.text.slice(0, 3000);
                });
                finalReply = result.slice(0,5);
              } else {
                finalReply = [result];
              }
            } else {
              textReply = 'Command executed, but it didn\'t return anything.'; 
            }
          }
        } else {
          textReply = 'Command not found!'
        }
        break;  
    }

    if (textReply !== null && finalReply.length === 0) finalReply = [{ type: 'text', text: textReply }];
  
  } else if (messageHandlers.length > 0) {
    // message handler calls
    const info = { text: event.message.text };

    for (let index = 0; index < messageHandlers.length; index++) {
      // loop all message handlers
      if ((locks[source.userId] && locks[source.userId] !== index) || (messageHandlers[index].admin && source.userId !== adminId)) {
        continue;
      }

      let {result, final, lock} = await messageHandlers[index].handle(info, source);

      if (result !== undefined) {
        if (Array.isArray(result) && finalReply.length + result.length <= 5) {
          result.forEach((reply) => {
            if (reply.text && reply.text.length > 3000) reply.text = reply.text.slice(0, 3000);
          });
          finalReply.push(...result);
        } else if (finalReply.length < 5) {
          finalReply.push(result);
        }
      }

      if (lock !== undefined) {
        if (lock === true) {
          locks[source.userId] = index;
        } else if (locks[source.userId] === index) {
          delete locks[source.userId];
        }
      }

      if (final || finalReply.length === 5) {
        break;
      }
    }
  }

  // return the final reply, either from command handler or message handlers
  if (finalReply.length > 0) {
    return client.replyMessage(event.replyToken, finalReply);
  } else {
    return null;
  }
}

// main code
reloadModules();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Bob says hello from port ${port}!`);
});
