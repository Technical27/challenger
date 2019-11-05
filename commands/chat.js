const greetings = ['Cheers', 'Hello', 'Aloha', 'Bonjour', 'Hola', 'Hallo', 'Hi', 'Hiya', 'Sir', 'Doctor'];

module.exports = {
  name: 'chat',
  description: 'makes a channel you can use to talk to the bot',
  usage: '',
  aliases: [],
  execute: msg => {
    msg.author.send(`${greetings[Math.floor(Math.random() * greetings.length)]}, <@${msg.author.id}>, use this chat`);
  }
};
