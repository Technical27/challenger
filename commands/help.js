module.exports = {
  name: 'help',
  aliases: ['h'],
  description: 'prints help for all commands or a specified command',
  usage: '[command]',
  execute: (msg, args, globals) => {
    if (args.length > 0) {
      const command = globals.commands.get(args[0]) || globals.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));
      if (!command) return;
      if (command.admin && !globals.isAdmin(msg.author.id)) return;
      msg.author.send(`\`\`\`Name: ${command.name}\nDescription: ${command.description}\nUsage: ${globals.config.prefix}${command.name} ${command.usage}\nAliases: ${command.aliases.join(', ')}\`\`\``);
    }
    else {
      let res = '```Commands:\n';
      for (const [, command] of globals.commands.entries()) {
        if (!command.admin || globals.isAdmin(msg.author.id)) {
          res += `${command.name}: ${command.description}\n`;
        }
      }
      res += '```';
      msg.author.send(res);
    }
  }
};
