const Sequelize = require('sequelize');
const sconfig = require('./config/config.json');
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize(sconfig[process.env.STATE || 'development']);

const models = {};

fs.readdirSync(path.join(__dirname, 'models')).filter(f => f.endsWith('.js')).forEach(f => {
  const m = require(path.join(__dirname, 'models', f));
  m.init(sequelize);
  models[m.name] = m;
});

module.exports = models;
