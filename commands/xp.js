module.exports = {
  name: 'xp',
  description: 'gets your current xp',
  usage: '',
  aliases: 'x',
  execute: async (msg, args, globals) => {
    const user = await globals.models.User.findByPk(msg.author.id);
    if (user) {
      msg.channel.send(`Your xp: ${user.xp}`, {code: true});
    }
    else {
      msg.channel.send('You have no xp', {code: true});
    }
  }
};
