const Messages = require('../models/message');
const Users = require('../models/user');
const Groups = require('../models/group')
const sequelize = require('../util/db');
const { Op } = require('sequelize');

exports.addMessage = async (req, res, next) => {
    try {
        const msg = req.body.message;
        const data = await Messages.create({
            message: msg,
            user_id: req.user.id,
        });
        res.json({ datavalues: data });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to add message' });
    }
};

exports.getMessage = async (req, res, next) => {
    try {
        const lastMsgId = req.query.lastmsgid || 0; // Get the last message ID from the query parameter
        const messages = await Messages.findAll({
            where: {
                id: { [Op.gt]: lastMsgId },
                group_id: null // Fetch messages with ID greater than lastMsgId
            },
            include: [
                {
                    model: Users,
                    attributes: ['name'],
                },
                {
                    model: Groups,
                    attributes: ['id'],
                },
            ],
            order: [['id', 'ASC']],
        });

        const formattedMessages = messages.map((message) => ({
            id: message.id,
            message: message.message,
            sender: message.user.name,
            group_id: message.group_id, // Include group_id directly from the message object
        }));

        res.json({ messages: formattedMessages });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to get messages' });
    }
};


exports.addGroupMessage = async (req, res, next) => {
    try {
        const groupId = req.params.groupId; // Get the group ID from the route parameter
        const message = req.body.message.message;

        const data = await Messages.create({
            message,
            user_id: req.user.id,
            group_id: groupId, // Associate the message with the specified group ID
        });

        res.json({ datavalues: data });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to add group message' });
    }
};

exports.getGroupMessages = async (req, res, next) => {
    try {
        const groupId = req.params.groupId; // Get the group ID from the route parameter
        
        const messages = await Messages.findAll({
            where: { group_id: groupId }, // Filter messages by group ID
            include: [
                {
                    model: Users,
                    attributes: ['name'],
                },
            ],
            order: [['id', 'ASC']],
        });

        const formattedMessages = messages.map((message) => ({
            id: message.id,
            message: message.message,
            sender: message.user.name,
        }));

        res.json({ messages: formattedMessages });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to get group messages' });
    }
};


