// constants
const maxSearchKeyLength = 100;
const timeout = 1000;
const api_url = "https://www.googleapis.com/youtube/v3/search";
const api_key = process.env.API_KEY_YOUTUBE;

// handler information
const command = 'youtube'; // command handler
const alias = ['yt', 'y'];
const syntax = 'youtube\n(search keyword)';
const description = 'Searches Youtube with the inputted keyword. Maximum keyword length is '+maxSearchKeyLength+' characters.';
const admin = false;

// library requirements
const querystring = require('querystring');
const fetch = require('node-fetch');

// templates
let carouselTemplate = (contents) => ({
  type: "carousel",
  contents: contents
})
let bubbleTemplate = (thumbnailUrl, title, link) => (
{
  type: "bubble",
  body: {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "image",
        url: thumbnailUrl,
        size: "full",
        aspectMode: "cover",
        aspectRatio: "3:2",
        gravity: "center"
      },
      {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            color: "#FFFFFF",
            text: title,
            size: "md",
            weight: "bold"
          }
        ],
        position: "absolute",
        offsetBottom: "0px",
        offsetEnd: "0px",
        backgroundColor: "#00000066",
        paddingAll: "15px",
        paddingTop: "10px",
        height: "50px",
        offsetStart: "0px"
      }
    ],
    paddingAll: "0px"
  },
  action: {
    type: "uri",
    label: "action",
    uri: link
  }
});

// handler function
async function handle(info, source) {
  var result = { type: 'text', text: 'No result!' };
  var keyword = info.args.join(' ');
  if (info.args.length < 1 || keyword.length > maxSearchKeyLength) {
    result.text = 'Type .help youtube for instructions.'
  } else {
    try {
      let params = querystring.stringify({
        part: 'snippet',
        key: api_key,
        maxResults: 10,
        q: keyword,
        type: 'video'
      });

      let json = await fetch(api_url + '?' + params, {timeout: timeout}).then(res => res.json());

      results = []
      json.items.forEach((item) => {
        results.push(bubbleTemplate(item.snippet.thumbnails.high.url, item.snippet.title.slice(0,40), 'https://www.youtube.com/watch?v='+item.id.videoId));
      });

      if (results.length > 0) {
        result = { type: 'flex', altText: 'Youtube search result.', contents: carouselTemplate(results) };
      } else {
        result.text = 'No result!';
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