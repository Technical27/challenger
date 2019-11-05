module.exports = {
  name: 'status',
  aliases: ['s'],
  description: 'gets bot status',
  usage: '',
  execute: msg => {
    msg.channel.send('```I\'m pretty sure that the bot works```');
  }
};
