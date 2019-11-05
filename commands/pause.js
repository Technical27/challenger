module.exports = {
  name: 'pause',
  description: 'pauses current audio',
  usage: '',
  aliases: [],
  execute: msg => {
    if (msg.channel.type !== 'text') return;
    const vc = msg.client.voice.connections.get(msg.guild.id);
    if (!vc) return;
    if (vc.dispatcher.paused) vc.dispatcher.resume();
    else vc.dispatcher.pause();
  }
};
