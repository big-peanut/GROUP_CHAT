const Groups = require('../models/group');
const GroupMember = require('../models/groupMember');
const Messages = require('../models/message')
const Users = require('../models/user');

async function createGroup(req, res) {
    try {
        const { group_name } = req.body;
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

        // Delete the group messages
        await Messages.destroy({
            where: { group_id },
        });

        // Delete the group
        await Groups.destroy({
            where: { id: group_id },
        });

        res.status(200).json({ message: 'Group and associated messages deleted successfully' });
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

async function getGroupUsers(req, res) {
    try {
        const { group_id } = req.params;

        const groupMembers = await GroupMember.findAll({
            where: { group_id },
            include: [
                {
                    model: Users,
                    attributes: ['id', 'name'], // Include the 'id' attribute
                },
            ],
        });

        const users = groupMembers.map((member) => ({
            id: member.user.id, // Add the 'id' attribute from the nested 'user' object
            name: member.user.name,
            is_admin: member.is_admin,
        }));

        res.status(200).json({ users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch group users' });
    }
}




async function checkGroupMembership(req, res) {
    try {
        const { group_id } = req.params;
        const { id: user_id } = req.user;

        const groupMember = await GroupMember.findOne({
            where: { group_id, user_id },
        });

        if (groupMember) {
            res.status(200).json({ isMember: true });
        } else {
            res.status(200).json({ isMember: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to check group membership' });
    }
}

async function makeGroupMemberAdmin(req, res) {
    try {
        const { group_id, user_id } = req.params;

        // Check if the current user is the group admin
        const groupMember = await GroupMember.findOne({
            where: { group_id: group_id, user_id: req.user.id, is_admin: true },
        });

        if (!groupMember) {
            return res.status(401).json({ error: 'You are not authorized to perform this action' });
        }

        // Find the group member to be made admin
        const memberToBeMadeAdmin = await GroupMember.findOne({
            where: { group_id: group_id, user_id: user_id },
        });

        if (!memberToBeMadeAdmin) {
            return res.status(404).json({ error: 'Group member not found' });
        }

        // Update the is_admin flag to true
        memberToBeMadeAdmin.is_admin = true;
        await memberToBeMadeAdmin.save();

        res.status(200).json({ message: 'Group member is now an admin' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to make group member an admin' });
    }
}

async function removeGroupMember(req, res) {
    try {
        const { group_id, user_id } = req.params;

        // Check if the current user is the group admin
        const groupMember = await GroupMember.findOne({
            where: { group_id: group_id, user_id: req.user.id, is_admin: true },
        });

        if (!groupMember) {
            return res.status(401).json({ error: 'You are not authorized to perform this action' });
        }

        // Find the group member to be removed
        const memberToBeRemoved = await GroupMember.findOne({
            where: { group_id: group_id, user_id: user_id },
        });

        if (!memberToBeRemoved) {
            return res.status(404).json({ error: 'Group member not found' });
        }

        // Delete the group member
        await memberToBeRemoved.destroy();

        res.status(200).json({ message: 'Group member removed successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to remove group member' });
    }
}




module.exports = {
    createGroup,
    getGroups,
    deleteGroup,
    inviteMemberToGroup,
    getGroupUsers,
    checkGroupMembership,
    makeGroupMemberAdmin,
    removeGroupMember
};
