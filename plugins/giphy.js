// constants
const maxSearchKeyLength = 100;
const timeout = 1000;
const api_key = process.env.API_KEY_GIPHY;

// handler information
const command = 'giphy'; // command handler
const alias = ['gif', 'g'];
const syntax = 'giphy\n[search keyword]'
const description = 'Searches Giphy for a random gif related to the inputted keyword. Maximum keyword length is '+maxSearchKeyLength+' characters.';
const admin = false;

// library requirements
const giphy = require('giphy-api')({
  apiKey: api_key,
  timeout: timeout
});

// handler function
async function handleMessage(info, source) {
  var replies = [{ type: 'text', text: 'No result!' }];
  var keyword = info.args.join(' ');
  if (info.args.length < 1 || keyword.length > maxSearchKeyLength) {
    replies[0].text = 'Type .help giphy for instructions.'
  } else {
    try {
      let json = await giphy.search(keyword);
      let data = json.data;
      let index = Math.floor(Math.random() * 26);
      let gif = data[index];
      replies[0] = { type: 'image', originalContentUrl: gif.images.fixed_width.url, previewImageUrl: gif.images.fixed_width_downsampled.url }
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