// constants
const codeTimeout = 100;

// handler information
const command = 'evaluate'; // command handler
const alias = ['js', 'javascript', 'e', 'eval'];
const syntax = 'evaluate [javascript code]'
const description = 'Compiles the inputted Javascript code with `safe-eval` and displays the returned value. Timeout after code runs for '+codeTimeout+'ms.';
const admin = false;

// library requirements
const safeEval = require('safe-eval');

// handler function
function handleMessage(info, source) {
  var text = 'Code evaluation failed!';
  if (info.args.length < 1) {
    text = 'Type .help evaluate for instructions.'
  } else {
    var context = {
      cout: null, 
      print: (x) => {if (context.cout) {context.cout += String(x);} else {context.cout = String(x);}},
      println: (x) => context.print(String(x) + '\n')
    }
    try {
      text = String(safeEval('0;'+info.args.join(' '), context, {timeout: codeTimeout}));
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