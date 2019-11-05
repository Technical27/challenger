module.exports = {
  name: 'skip',
  description: 'skips the currently playing video',
  usage: '',
  aliases: '',
  execute: msg => {
    const vc = msg.client.voice.connections.get(msg.guild.id);
    if (!vc) return;
    vc.dispatcher.end();
  }
};
