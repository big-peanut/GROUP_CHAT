const express = require('express')
const userRoutes = require('./routes/userRoutes')
const messageRoutes=require('./routes/messageRoutes')
const bodyparser = require('body-parser')
const cors = require('cors')
const sequelize = require('./util/db')
const Users=require('./models/user')
const Messages=require('./models/message')

const app = express()

app.use(bodyparser.json())

app.use(cors())

app.use(userRoutes)
app.use(messageRoutes)

Users.hasMany(Messages, { foreignKey: 'user_id' });
Messages.belongsTo(Users, { foreignKey: 'user_id' });

sequelize.sync()
    .then((res) => {
        app.listen(3000)
    })
    .catch((err) => {
        console.log(err)
    })
