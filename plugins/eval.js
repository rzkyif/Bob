// handler information
const command = 'eval'; // command handler
const alias = ['js', 'javascript'];
const syntax = 'eval [javascript code]'
const description = 'Attempts to compile and run JavaScript code and returns the returned value.';
const admin = false;

// library requirements
const safeEval = require('safe-eval');

// handler function
function handleMessage(info, source) {
  let text;
  try {
    text = safeEval(info.args.join(' '));
  } catch (error) {
    text = error.message;
  }
  const replies = [{ type: 'text', text: text }];
  return { replies: replies, final: true };
}

// exports setup
exports.handleMessage = handleMessage;
exports.command = command;
exports.alias = alias;
exports.syntax = syntax;
exports.description = description;
exports.admin = admin;