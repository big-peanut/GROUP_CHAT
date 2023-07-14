const Sequelize = require('sequelize');
const sequelize = require('../util/db');
const Groups=require('../models/group')

const Messages = sequelize.define('messages', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  message: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  group_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'groups', // Name of the groups table
      key: 'id' // Primary key of the groups table
    }
  }
});

Messages.belongsTo(Groups, { foreignKey: 'group_id' });

module.exports = Messages;
