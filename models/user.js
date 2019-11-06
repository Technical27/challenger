const Sequelize = require('sequelize');

class User extends Sequelize.Model {
  static init (sequelize) {
    return super.init({
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      xp: Sequelize.INTEGER
    }, {sequelize});
  }

  async addXp () {
    this.xp += 1;
    await this.save();
  }
}

User.name = 'User';

module.exports = User;
