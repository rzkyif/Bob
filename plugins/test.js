// handler information
const command = 'test'; // command handler
const alias = ['t'];
const syntax = 'test [anything]'
const description = 'Prints out the command and arguments that were inputted.';
const admin = false;

// handler function
function handleMessage(info, source) {
  let text = 'Command: ' + info.command;
  text += '\n\nArguments'
  info.args.forEach((arg, i) => {
    text += '\n' + i + ':\n' + arg;
  });
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