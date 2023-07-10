const express = require('express')
const userRoutes = require('./routes/userRoutes')
const bodyparser = require('body-parser')
const cors = require('cors')
const sequelize = require('./util/db')

const app = express()

app.use(bodyparser.json())

app.use(cors())

app.use(userRoutes)

sequelize.sync()
    .then((res) => {
        app.listen(3000)
    })
    .catch((err) => {
        console.log(err)
    })
