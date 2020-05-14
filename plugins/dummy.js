// handler information
const command = 'dummy'; // command handler
const alias = ['d', 'doctor', 'demo'];
const syntax = 'dummy [anything]'
const description = 'Prints out command and arguments';
const admin = false;

// handler function
function handleMessage(info, source) {
  const reply = { type: 'text', text: 'Command: '+info.command+'\nArgs: '+info.args.join(', ') };
  return { reply: reply, final: true };
}

// exports setup
exports.handleMessage = handleMessage;
exports.command = command;
exports.alias = alias;
exports.syntax = syntax;
exports.description = description;
exports.admin = admin;