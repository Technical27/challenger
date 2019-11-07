module.exports = {
  name: 'reload',
  admin: true,
  description: 'reloads bot commands',
  aliases: [],
  usage: '',
  execute: (msg, args, {reloadCommands}) => {
    return reloadCommands()
      .then(() => {
        msg.channel.send('finished reloading commands', {code: true});
      })
      .catch(e => {
        msg.channel.send(`error loading commands: ${e}`, {code: true});
      });
  }
};
