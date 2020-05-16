// handler information
const command = 'test'; // command handler
const alias = ['t'];
const syntax = 'test\n[argument(s)]'
const description = 'Prints out the command and arguments that were inputted.';
const admin = false;

// handler function
async function handle(info, source) {
  let text;
  text = 'Command:\n' + info.command;
  text += '\n\nArguments:'
  info.args.forEach((arg, i) => {
    text += '\n[' + i + ']\n"' + arg + '"';
  });
  return { result: { type: 'text', text: text }, final: true };
}

// exports setup
exports.handle = handle;
exports.command = command;
exports.alias = alias;
exports.syntax = syntax;
exports.description = description;
exports.admin = admin;