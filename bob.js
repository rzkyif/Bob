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
  adminPassword: process.env.ADMIN_PASSWORD,
  pluginDirectory: './plugins'
};

// constants
const client = new line.Client(config);
const app = express();

// variables
var messageHandlers = []
var commands = []
var locks = {}
var adminId = ''

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
  var files = fs.readdirSync(config.pluginDirectory).forEach((file) => {
    var pluginPath = './' + path.join(config.pluginDirectory, file);
    var plugin = require(pluginPath);
    messageHandlers.push(plugin);
    if (plugin.command) {
      commands.push(plugin.command)
    }
    delete require.cache[require.resolve(pluginPath)];
  })
  console.log('Module reload successful!');
}
reloadModules();

// global event handle
function handleEvent(event) {

  // only handle text messages
  if (event.type !== 'message' || event.message.type !== 'text' ) {
    return Promise.resolve(null);
  }

  // extract event information
  const input = event.message.text.match(/(?:[^\s"]+|"[^"]*")+/g);
  const command = input[0].slice(1).toLowerCase();
  var args = null;
  if (input.length > 1) {
    args = input.slice(1);
  }
  const source = { 
    type: event.source.type, 
    placeId: (event.source.type === 'group' ? event.source.groupId : (event.source.type === 'room' ? event.source.roomId : null)), 
    userId: event.source.userId 
  };

  // start processing
  var finalReply = null;
  if (input[0].startsWith('.') && command === 'op') {
    // op command, to register admin
    var reply;
    if (source.placeId || args[0] !== config.adminPassword) {
      reply = 'Wrong password!';
    } else {
      adminId = source.userId;
      reply = 'New admin registered!';
    }
    finalReply = { type: 'text', text: reply };
  } else if (input[0].startsWith('.') && command === 'refresh') {
    // refresh command, to reload modules
    var reply;
    if (source.placeId || source.userId !== adminId) {
      reply = 'You are not the administrator of this bot!';
    } else {
      reloadModules();
      reply = 'New admin registered!';
    }
    finalReply = { type: 'text', text: reply };
  } else if (input[0].startsWith('.') && command === 'help') {
    // help function, to check documentation
    reply = "";
    if (args) {
      var i = commands.findIndex((c) => c === args[0])
      if (i >= 0) {
        reply = "Syntax: " + messageHandlers[i].syntax;
        reply += "\n\n" + messageHandlers[i].description;
        reply += "\n\nAlias: " + messageHandlers[i].alias.join(', ');
      } else {
        reply = "Command not found!"
      }
    } else {
      reply = "Available commands:\n";
      reply += commands.join(', ');
    }
    finalReply = { type: 'text', text: reply };
  } else {
    // everything else goes here
    for (var i = 0; i < messageHandlers.length; i++) {
      // pass message only to proper handlers
      if (
        (messageHandlers[i].command && (!input[0].startsWith('.') || (messageHandlers[i].command !== command && !(command in messageHandlers[i].alias)))) || 
        (messageHandlers[i].admin && source.userId !== adminId) ||
        (source.userId in locks && i != locks[source.userId])
      ) {
        continue;
      }

      // ready info for passing according to handler type
      var info;
      if (messageHandlers[i].command) {
        info = { command: command, args: args };
      } else {
        info = { text: event.message.text };
      }
      info.time = event.timestamp;
      
      // process with handler
      const {reply, final, lock} = messageHandlers[i].handleMessage(info, source);
      if (final && reply) {
        finalReply = reply;
        break;
      }
      if (lock !== undefined) {
        if (lock === true) {
          locks[source.userId] = i;
        } else {
          delete locks[source.userId];
        }
      }
    }
  }

  // return the final reply
  if (finalReply) {
    return client.replyMessage(event.replyToken, finalReply);
  } else {
    return Promise.resolve(null);
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Bob is now alive on port ${port}.`);
});
