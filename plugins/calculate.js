// constants
const maxExpressionLength = 100;

// handler information
const command = 'calculate'; // command handler
const alias = ['calc', 'c', 'mathjs', 'math'];
const syntax = 'calculate\n(mathematical expression)'
const description = 'A command that lets users solve mathematical expressions with `MathJS`. Maximum mathematical expression length is '+maxExpressionLength+' characters.';
const admin = false;

// library requirements
const math = require('mathjs');

// handler function
async function handle(info, source) {
  let text;
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
  return { result: { type: 'text', text: text } };
}

// exports setup
exports.handle = handle;
exports.command = command;
exports.alias = alias;
exports.syntax = syntax;
exports.description = description;
exports.admin = admin;