const Discord = require('discord.js');
const config = require('./config/bot.json');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const decache = require('decache');
const chalk = require('chalk');
const winston = require('winston');
const models = require('./db');
const client = new Discord.Client();
const commands = new Discord.Collection();

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

    if (!msg.content.startsWith(config.prefix)) {
      return models.User.findByPk(msg.author.id).then(user => {
        if (user) user.addXp();
        else models.User.create({id: msg.author.id, xp: 1});
      });
    }

    const args = msg.content.slice(config.prefix.length).split(/\s+/);
    const cmdName = args.shift().toLowerCase();
    const command = commands.get(cmdName) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

    if (!command) return;

    if (command.admin && !config.admins.includes(msg.author.id)) return;

    logger.log('info', `'${msg.author.tag}' issued command '${cmdName}' with args '${args.join(' ')}'`);

    command.execute(msg, args, globals);
  }
  catch (e) {
    logger.log('error', e);
    msg.channel.send(`something broke and here's the error:\n\`\`\`${e}\`\`\``);
  }
});

process.on('SIGINT', async () => {
  logger.log('info', 'destroying client');
  await client.destroy();
  process.exit();
});

const loadCommand = f => {
  return new Promise((resolve, reject) => {
    try {
      const cmd = require(f);
      cmd.path = f;
      commands.set(cmd.name, cmd);
      logger.log('info', `loaded command ${cmd.name}`);
      resolve();
    }
    catch (e) {
      reject(e);
    }
  });
};

const loadCommands = () => {
  logger.log('info', 'loading commands');
  return fs.readdirAsync('commands')
    .then(files => {
      const filePromises = files.filter(f => f.endsWith('.js'))
        .map(f => loadCommand(path.join(__dirname, 'commands', f)));
      return Promise.all(filePromises);
    })
    .then(() => {
      globals.commands = commands;
    });
};

const unloadCommand = f => {
  return new Promise((resolve, reject) => {
    try {
      decache(f);
      resolve();
    }
    catch (e) {
      reject(e);
    }
  });
};

const reloadCommands = () => {
  logger.log('info', 'reloading commands');
  return new Promise(resolve => {
    const unloadPromises = commands.array().map(cmd => unloadCommand(cmd));
    return Promise.all(unloadPromises)
      .then(loadCommands)
      .then(resolve);
  });
};

fs.watch('commands', (event, file) => {
  if (file.endsWith('.js') && event === 'change') {
    const cmdPath = path.join(__dirname, 'commands', file);
    unloadCommand(cmdPath)
      .then(() => loadCommand(cmdPath))
      .catch(e => logger.log('error', `error reload command: ${e}`));
  }
});

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
  playQue: [],
  models,
  nowPlaying: ''
};

loadCommands()
  .then(() => client.login(config.token))
  .catch(e => logger.log('error', `error loading commands: ${e}`));
