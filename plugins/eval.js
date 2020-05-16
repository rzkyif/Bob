'use strict';

// constants
const codeTimeout = 200;

// handler information
const command = 'evaluate'; // command handler
const alias = ['js', 'javascript', 'e', 'eval'];
const syntax = 'evaluate\n(javascript code)';
const description = 'A command that lets users compile and run simple Javascript code using `safe-eval`. Timeout happens after code runs for '+codeTimeout+'ms.\n\nThere are two special functions that can be used inside the script:\n1. print(x): to print x\n2. println(x): to print x and a newline';
const admin = false;

// library requirements
const safeEval = require('safe-eval');

// handler function
async function handle(info, source) {
  let text;
  if (info.args.length < 1) {
    text = 'Type .help evaluate for instructions.'
  } else {
    let context = {
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
  return { result: { type: 'text', text: text } };
}

// exports setup
exports.handle = handle;
exports.command = command;
exports.alias = alias;
exports.syntax = syntax;
exports.description = description;
exports.admin = admin;