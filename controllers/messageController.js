const Messages = require('../models/message')
const Users = require('../models/user')
const sequelize = require('../util/db')

exports.addMessage = async (req, res, next) => {
    try {
        const msg = req.body.message
        const data = await Messages.create({
            message: msg,
            user_id: req.user.id
        })
        res.json({ datavalues: data })
    }
    catch (err) {
        console.log(err)
    }
}

exports.getMessage = async (req, res, next) => {
    try {
        const messages = await Messages.findAll({
            include: [
                {
                    model: Users,
                    attributes: ['name'],
                },
            ],
        });

    
        const formattedMessages = messages.map(message => ({
            id: message.id,
            message: message.message,
            sender: message.user.name,
        }));

        res.json({ messages: formattedMessages });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to get messages" });
    }
}