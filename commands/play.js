const ytdl = require('ytdl-core');

let playing = false;

const playStream = async (vc, globals) => {
  playing = true;
  const url = globals.playQue.shift();
  globals.nowPlaying = url;
  const stream = await ytdl(url, {filter: 'audioonly'});
  const con = await vc.join();
  vc.on('disconnect', () => playing = false);
  const disp = con.play(stream);
  disp.on('end', () => {
    if (globals.playQue.length > 0) playStream(vc, globals);
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

    if (!msg.member.voice.channel || msg.member.voice.channel.id !== globals.config.musicChannel) return msg.channel.send('Please join the music channel to play music', {code: true});

    const [url] = args;
    if (!ytdl.validateURL(url)) return msg.channel.send('Invalid URL', {code: true});

    globals.playQue.push(url);
    const info = await ytdl.getInfo(url);
    if (playing) {
      msg.channel.send(`Added '${info.player_response.videoDetails.title}' to que`, {code: true});
    }
    else {
      msg.channel.send(`Now playing '${info.player_response.videoDetails.title}'`, {code: true});
      playStream(msg.member.voice.channel, globals);
    }
  }
};
