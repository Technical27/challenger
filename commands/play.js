const ytdl = require('ytdl-core');

let playing = false;

const playStream = async (vc, que) => {
  playing = true;
  const url = que.shift();
  if (!ytdl.validateURL(url)) return;
  const stream = await ytdl(url, {filter: 'audioonly'});
  const con = await vc.join();
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
  execute: (msg, args, globals) => {
    if (msg.channel.type !== 'text') return;

    if (!msg.member.voice.channel || msg.member.voice.channel.id !== '638812502083502080') return msg.channel.send('```Please join the music channel to play music```');

    globals.playQue.push(args[0]);
    if (!playing) playStream(msg.member.voice.channel, globals.playQue);
  }
};
