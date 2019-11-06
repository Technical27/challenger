module.exports = {
  name: 'stop',
  description: 'stops playing the current video and clears the que',
  aliases: ['leave'],
  usage: '',
  execute: (msg, args, globals) => {
    if (msg.channel.type !== 'text') return;
    globals.playQue = [];
    globals.nowPlaying = '';
    const vc = msg.client.voice.connections.get(msg.guild.id);
    if (!vc) return;
    vc.disconnect();
  }
};
