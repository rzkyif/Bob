// handler information
const command = 'eval'; // command handler
const alias = ['js', 'javascript'];
const syntax = 'eval [javascript code]'
const description = 'Compiles the inputted Javascript code with `safe-eval` and displays the returned value.';
const admin = false;

// library requirements
const safeEval = require('safe-eval');

// handler function
function handleMessage(info, source) {
  var text = 'Code evaluation failed!';
  try {
    text = String(safeEval(info.args.join(' ')));
  } catch (e) {
    text = 'Code evaluation failed!';
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