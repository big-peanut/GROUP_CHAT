const Sequelize=require('sequelize')

const sequelize=require('../util/db')

const Messages=sequelize.define('messages',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    user_id:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    message:{
        type:Sequelize.TEXT,
        allowNull:false
    }
})

module.exports=Messages
