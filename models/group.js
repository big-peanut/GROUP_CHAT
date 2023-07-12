const Sequelize = require('sequelize')
const sequelize = require('../util/db')
const Users = require('../models/user')

const Group = sequelize.define('group', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Users,
            key: 'id'
        }
    }
})

module.exports=Group