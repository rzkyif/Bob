// handler information
const command = null; // text handler
const alias = null;
const syntax = 'henlo [anything]'
const description = 'Say henlo back if message starts with henlo';
const admin = false;

// handler function
function handleMessage(info, source) {
  let text = info.text.toLowerCase();

  if ( !text.startsWith('henlo') ) {
    return { final: false };
  }

  const replies = [{ type: 'text', text: 'henlo, user ' + source.userId }];

  return { replies: replies, final: true };
}

// exports setup
exports.handleMessage = handleMessage;
exports.command = command;
exports.alias = alias;
exports.syntax = syntax;
exports.description = description;
exports.admin = admin;