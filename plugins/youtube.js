// constants
const maxSearchKeyLength = 100;
const api_url = "https://www.googleapis.com/youtube/v3/search"
const api_key = process.env.API_KEY_YOUTUBE;
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
        height: "40px",
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


// handler information
const command = 'youtube'; // command handler
const alias = ['yt', 'y'];
const syntax = 'youtube\n[search keyword]'
const description = 'Searches youtube with the inputted keyword. Maximum keyword length is '+maxSearchKeyLength+' characters.';
const admin = false;

// library requirements
const querystring = require('querystring');
const fetch = require('node-fetch');

// handler function
async function handleMessage(info, source) {
  var replies = [{ type: 'text', text: 'No result!' }];
  var keyword = info.args.join(' ');
  if (info.args.length < 1 || keyword.length > maxSearchKeyLength) {
    replies[0].text = 'Type .help youtube for instructions.'
  } else {
    try {
      let params = querystring.stringify({
        part: 'snippet',
        key: api_key,
        maxResults: 3,
        q: keyword
      });
      let link = api_url + '?' + params;
      let res = await fetch(link);
      console.log(link);
      let json = await res.json();
      console.log(json);
      let items = json.items;
      results = []
      items.forEach((item) => {
        results.push(bubbleTemplate(item.snippet.thumbnails.default.url, item.snippet.title, 'https://www.youtube.com/watch?v='+item.id.videoId));
      });
      replies[0] = carouselTemplate(results);
    } catch (e) {
      if (e && e.message) {
        replies[0].text = e.message;
      } else {
        replies[0].text = 'Mathematical evaluation failed!';
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