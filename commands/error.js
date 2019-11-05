module.exports = {
  name: 'error',
  description: 'test command that throws an error',
  usage: '',
  admin: true,
  aliases: ['e'],
  execute: () => {
    throw new Error('Test error');
  }
};
