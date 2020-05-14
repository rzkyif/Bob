// handler information
const command = 'calculate'; // command handler
const alias = ['calc', 'hitung', 'c', 'h'];
const syntax = 'calculate [expr1] [expr2] [...]'
const description = 'Attempts to solve the inputted mathematical expression. Can use result of previous expressions in later expressions.';
const admin = false;

// library requirements
const Calc = require('expression-calculator');

// handler function
function handleMessage(info, source) {
  let text;
  let calc = Calc();
  let results = {}
  info.args.forEach((arg, i) => {
    try {
        results['expr'+i] = calc.compile(arg).calc(results);
      } catch (error) {
        results['expr'+i] = null;
      }
  });
  text = 'Results:\n'
  for (let i = 0; i < info.args.length; i++) {
      let name = 'expr' + i;
      text += name + ' = ' + String(results[name]);
      if (i < info.args.length-1) text += '\n';
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