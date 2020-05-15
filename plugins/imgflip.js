// constants
const maxTextLength = 50;
const timeout = 1000;
const api_url_get = 'https://api.imgflip.com/get_memes'
const api_url_caption = 'https://api.imgflip.com/caption_image'
const api_password_imgflip = process.env.API_PASSWORD_IMGFLIP;
const api_username_imgflip = process.env.API_USERNAME_IMGFLIP;

// handler information
const command = 'imgflip'; // command handler
const alias = ['imgf', 'meme', 'm'];
const syntax = 'imgflip\n(text1)\n[text2]\n[text3]\n[text4]\n[text5]'
const description = 'Creates a meme using Imgflip templates with the inputted text. Maximum length for each text is '+maxTextLength+' characters.\n\nDisclaimer: Generated image will automatically be stored and be made publicly available in Bob\'s Imgflip account.';
const admin = false;

// library requirements
const fetch = require('node-fetch');

// handler function
async function handleMessage(info, source) {
  var replies = [{ type: 'text', text: 'No result!' }];
  if (info.args.length < 1 || info.args.length > 5 || info.args.some((arg) => arg.length > maxTextLength)) {
    replies[0].text = 'Type .help imgflip for instructions.'
  } else {
    try {
      let templates = await fetch(api_url_get).then(res => res.json());
      let index = Math.floor(Math.random() * 101);
      let template_id = templates.data.memes[index].id;
      let boxes = []
      info.args.forEach(arg => {
        boxes.push( { text: arg } );
      });
      let body = new URLSearchParams();
      body.append('template_id', template_id);
      body.append('username', api_username_imgflip);
      body.append('password', api_password_imgflip);
      body.append('text0', info.args[0]);
      if (info.args[1] !== undefined) body.append('text1', info.args[1]);
      body.append('boxes', boxes);
      let json = await fetch(api_url_caption, { method: 'POST', body: body, timeout: timeout }).then(res => res.json());
      if (json.success === true) {
        replies[0] = { type: 'image', originalContentUrl: json.data.url, previewImageUrl: json.data.url }
      } else {
        replies[0] = { type: 'text', text: json.error_message }
      }
    } catch (e) {
      if (e && e.message) {
        replies[0].text = e.message;
      } else {
        replies[0].text = 'No result!';
      }
    }
  }
  return { replies: replies, final: true };
}

// exports setup
exports.handleMessage = handleMessage;
exports.command = command;
exports.alias = alias;
exports.syntax = syntax;
exports.description = description;
exports.admin = admin;