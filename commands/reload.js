module.exports = {
  name: 'reload',
  admin: true,
  description: 'reloads bot commands',
  aliases: [],
  usage: '',
  execute: (msg, args, globals) => globals.reloadCommands()
};
