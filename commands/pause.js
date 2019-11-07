module.exports = {
  name: 'pause',
  description: 'pauses current audio',
  usage: '',
  aliases: [],
  execute: msg => {
    if (msg.channel.type !== 'text') return;
    const vc = msg.client.voice.connections.get(msg.guild.id);
    if (!vc) return;
    if (vc.dispatcher.paused) {
      msg.channel.send('resuming playback', {code: true});
      vc.dispatcher.resume();
    }
    else {
      msg.channel.send('pausing song', {code: true});
      vc.dispatcher.pause();
    }
  }
};
