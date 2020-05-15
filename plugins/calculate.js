// constants
const maxExpressionLength = 100;

// handler information
const command = 'calculate'; // command handler
const alias = ['calc', 'hitung', 'c', 'mathjs', 'math'];
const syntax = 'calculate\n[mathematical expression]'
const description = 'Attempts to solve the inputted mathematical expression with `MathJS`. Maximum expression length is '+maxExpressionLength+' characters.';
const admin = false;

// library requirements
const math = require('mathjs');

// handler function
async function handleMessage(info, source) {
  var text = 'Mathematical evaluation failed!';
  if (info.args.length < 1 || info.args.join('').length > maxExpressionLength) {
    text = 'Type .help calculate for instructions.'
  } else {
    try {
      text = String(math.evaluate(info.args.join(' ')));
    } catch (e) {
      if (e && e.message) {
        text = e.message;
      } else {
        text = 'Mathematical evaluation failed!';
      }
    }
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