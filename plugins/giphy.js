// constants
const maxKeywordLength = 100;
const timeout = 1000;
const api_key = process.env.API_KEY_GIPHY;

// handler information
const command = 'giphy'; // command handler
const alias = ['gif', 'g'];
const syntax = 'giphy\n(keyword)'
const description = 'A command that lets users search Giphy for a random gif related to the keyword. Maximum keyword length is '+maxKeywordLength+' characters.';
const admin = false;

// library requirements
const giphy = require('giphy-api')({
  apiKey: api_key,
  timeout: timeout
});

// handler function
async function handle(info, source) {
  var result = { type: 'text', text: 'No result!' };
  var keyword = info.args.join(' ');
  if (info.args.length < 1 || keyword.length > maxKeywordLength) {
    result.text = 'Type .help giphy for instructions.'
  } else {
    try {
      let json = await giphy.search(keyword);
      let gif = json.data[Math.floor(Math.random() * 26)];
      result = { type: 'image', originalContentUrl: gif.images.fixed_width.url, previewImageUrl: gif.images.fixed_width.url }
    } catch (e) {
      if (e && e.message) {
        result.text = e.message;
      } else {
        result.text = 'No result!';
      }
    }
  }
  return { result: result, final: true };
}

// exports setup
exports.handle = handle;
exports.command = command;
exports.alias = alias;
exports.syntax = syntax;
exports.description = description;
exports.admin = admin;