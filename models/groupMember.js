const Sequelize = require('sequelize');
const sequelize = require('../util/db');
const Users = require('../models/user')
const Group = require('../models/group')

const GroupMember = sequelize.define('group_member', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Group,
            key: 'id'
        }
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Users,
            key: 'id'
        }
    },
    is_admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
})

module.exports=GroupMember