'use strict';

const fs = require('fs')
const path = require('path')
const line = require('@line/bot-sdk');
const express = require('express');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
  pluginDirectory: './plugins'
};

const client = new line.Client(config);
const app = express();

var eventHandlers = []

app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function refreshModules() {
  var files = fs.readdirSync(config.pluginDirectory).forEach((file) => {
    var pluginPath = './' + path.join(config.pluginDirectory, file)
    eventHandlers.push(require(pluginPath));
    delete require.cache[require.resolve(pluginPath)];
  })
}
refreshModules();

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  var finalReply = null;
  if (event.message.text === '.refresh') {
    refreshModules();
    finalReply = { type: 'text', text: 'Modules reloaded!' };
  } else {
    for (var i = 0; i < eventHandlers.length; i++) {
      const {reply, final} = eventHandlers[i].handleEvent(event);
      if (final && reply) {
        finalReply = reply;
        break;
      }
    }
  }

  if (finalReply) {
    return client.replyMessage(event.replyToken, result);
  } else {
    return Promise.resolve(null);
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Bob is now alive on port ${port}.`);
});
