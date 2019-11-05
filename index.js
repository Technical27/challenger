const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');
const decache = require('decache');
const chalk = require('chalk');
const winston = require('winston');
const Sequelize = require('sequelize');


const client = new Discord.Client();
const commands = new Discord.Collection();
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'db.sqlite')
});

const colorFormat = level => {
  if (level === 'info') return chalk.white(level);
  else if (level === 'error') return chalk.red(level);

  return chalk.grey;
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({filename: 'errors.log', level: 'error'})
  ],
  format: winston.format.printf(log => `[${colorFormat(log.level)}]: ${log.message}`)
});

let globals = {};

client.on('ready', () => {
  logger.log('info', `logged on as ${client.user.tag}`);
  client.user.setActivity('-help', {type: 'PLAYING'});
});

client.on('message', msg => {
  try {
    if (msg.author.bot) return;

    if (!msg.content.startsWith(config.prefix)) return;

    const args = msg.content.slice(config.prefix.length).split(/\s+/);
    const cmdName = args.shift().toLowerCase();
    const command = commands.get(cmdName) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

    if (!command) return;

    if (command.admin && !config.admins.includes(msg.author.id)) return;

    logger.log('info', `'${msg.author.tag}' issued command '${cmdName}' with args '${args.join(' ')}'`);

    command.execute(msg, args, globals);
  }
  catch (e) {
    logger.log('error', e.toString());
    msg.channel.send(`something broke and here's the error:\n\`\`\`${e}\`\`\``);
  }
});

process.on('SIGINT', async () => {
  logger.log('info', 'destroying client');
  await client.destroy();
  process.exit();
});

const loadCommands = () => {
  logger.log('info', 'loading commands');
  fs.readdirSync('commands').filter(f => f.endsWith('.js')).forEach(f => {
    const modPath = path.join(__dirname, 'commands', f);
    const cmd = require(modPath);
    cmd.path = modPath;
    commands.set(cmd.name, cmd);
  });
  globals.commands = commands;
};

loadCommands();

const reloadCommands = () => {
  logger.log('info', 'reloading commands');
  for (const [, cmd] of commands) decache(cmd.path);
  loadCommands();
};

const isAdmin = id => config.admins.includes(id);

const getUserFromMention = mention => {
  const matches = mention.match(/^<@!?(\d+)>$/);

  if (!matches) return;

  return client.users.get(matches[1]);
};

globals = {
  reloadCommands,
  config,
  isAdmin,
  getUserFromMention,
  commands,
  sequelize,
  playQue: []
};

client.login(config.token);
