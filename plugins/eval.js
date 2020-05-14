// handler information
const command = 'eval'; // command handler
const alias = ['js', 'javascript', 'e'];
const syntax = 'eval [javascript code]'
const description = 'Compiles the inputted Javascript code with `safe-eval` and displays the returned value.';
const admin = false;

// library requirements
const safeEval = require('safe-eval');

// handler function
function handleMessage(info, source) {
  var context = {
    cout: null,
    print: (x) => {if (context.cout) {context.cout += String(x);} else {contex.cout = String(x);}},
    println: (x) => context.print(String(x) + '\n')
  }
  var text = 'Code evaluation failed!';
  try {
    text = String(safeEval(info.args.join(' ')), context);
  } catch (e) {
    if (e && e.message) {
      text = e.message;
    } else {
      text = 'Code evaluation failed!';
    }
  }
  if (context.cout !== null) {
    text = context.cout;
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