const ytdl = require('ytdl-core');

let playing = false;

const playStream = async (vc, que) => {
  playing = true;
  const url = que.shift();
  const stream = await ytdl(url, {filter: 'audioonly'});
  const con = await vc.join();
  vc.on('disconnect', () => playing = false);
  const disp = con.play(stream);
  disp.on('end', () => {
    if (que.length > 0) playStream(vc, que);
    else {
      playing = false;
      vc.leave();
    }
  });
};

module.exports = {
  name: 'play',
  description: 'plays audio from youtube',
  usage: '<url>',
  aliases: ['p'],
  execute: async (msg, args, globals) => {
    if (msg.channel.type !== 'text') return;

    if (!msg.member.voice.channel || msg.member.voice.channel.id !== globals.config.musicChannel) return msg.channel.send('```Please join the music channel to play music```');

    const [url] = args;
    if (!globals.playQue.has(msg.guild.id)) globals.playQue.set(msg.guild.id, []);
    const que = globals.playQue.get(msg.guild.id);
    if (!ytdl.validateURL(url)) return msg.channel.send('```Invalid URL```');

    que.push(url);
    const info = await ytdl.getInfo(url);
    if (playing) {
      msg.channel.send(`Added '${info.player_response.videoDetails.title}' to que`, {code: true});
    }
    else {
      msg.channel.send(`Now playing '${info.player_response.videoDetails.title}'`, {code: true});
      playStream(msg.member.voice.channel, que);
    }
  }
};
