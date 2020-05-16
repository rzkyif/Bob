'use strict';

// constants
const maxTextLength = 50;
const timeout = 1000;
const api_url_get = 'https://api.imgflip.com/get_memes';
const api_url_caption = 'https://api.imgflip.com/caption_image';
const api_password_imgflip = process.env.API_PASSWORD_IMGFLIP;
const api_username_imgflip = process.env.API_USERNAME_IMGFLIP;

// handler information
const command = 'imgflip'; // command handler
const alias = ['imgf', 'meme', 'm'];
const syntax = 'imgflip\n(text1)\n[text2]\n[text3]\n[text4]\n[text5]';
const description = 'A command that lets users create memes using Imgflip templates with the arguments as text. Maximum length for each text is '+maxTextLength+' characters.\n\nDisclaimer: Generated image will automatically be stored and be made publicly available in Bob\'s Imgflip account.';
const admin = false;

// library requirements
const fetch = require('node-fetch');

// handler function
async function handle(info, source) {
  var result = { type: 'text', text: 'No result!' };
  if (info.args.length < 1 || info.args.length > 5 || info.args.some((arg) => arg.length > maxTextLength)) {
    result.text = 'Type .help imgflip for instructions.'
  } else {
    try {
      let templates = await fetch(api_url_get).then(res => res.json());
      let template_id = templates.data.memes[Math.floor(Math.random() * 101)].id;

      let boxes = []
      info.args.forEach(arg => {
        boxes.push( { text: arg } );
      });

      let body = new URLSearchParams();
      body.append('template_id', template_id);
      body.append('username', api_username_imgflip);
      body.append('password', api_password_imgflip);
      body.append('text0', info.args);
      if (info.args[1] !== undefined) body.append('text1', info.args[1]);
      body.append('boxes', JSON.stringify(boxes));

      console.log(body);
      console.log(body.toString());

      let json = await fetch(api_url_caption, { method: 'POST', body: body, timeout: timeout }).then(res => res.json());
      if (json.success === true) {
        result = { type: 'image', originalContentUrl: json.data.url, previewImageUrl: json.data.url }
      } else {
        result = { type: 'text', text: json.error_message }
      }

    } catch (e) {
      if (e && e.message) {
        result.text = e.message;
      } else {
        result.text = 'No result!';
      }
    }
  }
  return { result: result };
}

// exports setup
exports.handle = handle;
exports.command = command;
exports.alias = alias;
exports.syntax = syntax;
exports.description = description;
exports.admin = admin;