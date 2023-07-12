const Groups = require('../models/group');
const GroupMember = require('../models/groupMember');
const Users = require('../models/user');

async function createGroup(req, res) {
    try {
        const { group_name } = req.body;
        console.log('groupname====', group_name)
        const { id } = req.user;
        const user_id = id

        // Create the group
        const createdGroup = await Groups.create({
            name: group_name,
            created_by: user_id
        });

        // Create a group member record for the user who created the group
        await GroupMember.create({
            group_id: createdGroup.id,
            user_id,
            is_admin: true
        });

        res.status(201).json({ group_id: createdGroup.id, groupname: group_name });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to create group' });
    }
}

async function getGroups(req, res) {
    try {
        const groups = await Groups.findAll();
        res.status(200).json({ groups });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
}

const deleteGroup = async (req, res) => {
    try {
        const { group_id } = req.params;

        // Delete the associated group members first
        await GroupMember.destroy({
            where: { group_id },
        });

        // Delete the group
        await Groups.destroy({
            where: { id: group_id },
        });

        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to delete group' });
    }
};

async function inviteMemberToGroup(req, res) {
    try {
        const { group_id } = req.params;
        const { userName } = req.body;

        // Find the user by name
        const user = await Users.findOne({ where: { name: userName } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user is already a member of the group
        const existingMember = await GroupMember.findOne({
            where: { group_id, user_id: user.id },
        });

        if (existingMember) {
            return res.status(400).json({ error: 'User is already a member of the group' });
        }

        // Add the user as a member of the group
        await GroupMember.create({
            group_id,
            user_id: user.id,
            is_admin: false
        });

        res.status(200).json({ message: 'User invited successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to invite user to group' });
    }
}



module.exports = { createGroup, getGroups, deleteGroup ,inviteMemberToGroup};
