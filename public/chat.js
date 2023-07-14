const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');
const createGroupButton = document.getElementById('create-group-button')
const groupInput = document.getElementById('group-input')
const groupList = document.getElementById('group-list')
const chatMessageElement = document.getElementById('chat-messages');
const userListElement = document.getElementById('user-list');

let selectedGroupId = null;

async function removeGroupMember(userId) {
    try {
        const token = localStorage.getItem('token');
        await axios.delete(
            `http://localhost:3000/removegroupmember/${selectedGroupId}/${userId}`,
            {
                headers: { 'Authorization': token },
            }
        );
        alert('Group member removed successfully');
        // Update group users after removing the member
        await displayGroupUsers(selectedGroupId);
    } catch (error) {
        console.log(error);
    }
}

async function makeGroupMemberAdmin(userId) {
    try {
        const token = localStorage.getItem('token');
        await axios.put(
            `http://localhost:3000/makegroupmemberadmin/${selectedGroupId}/${userId}`,
            {},
            {
                headers: { 'Authorization': token },
            }
        );
        alert('Group member is now an admin');
        // Update group users after making the member an admin
        await displayGroupUsers(selectedGroupId);
    } catch (error) {
        console.log(error);
    }
}

async function addGroupMessage(groupId, message) {
    try {
        const token = localStorage.getItem('token');
        await axios.post(
            `http://localhost:3000/addgroupmessage/${groupId}`,
            { message },
            {
                headers: { 'Authorization': token },
            }
        );
    } catch (error) {
        console.log(error);
    }
}

function displayUsers(users) {
    userListElement.innerHTML = '';

    for (let i = 0; i < users.length; i++) {
        const userElement = document.createElement('div');
        userElement.textContent = users[i].name;

        userListElement.appendChild(userElement);
    }
}

async function getUsers() {
    const response = await axios.get('http://localhost:3000/getusers');
    displayUsers(response.data.users);
}

async function inviteMembers() {
    const userName = prompt('Enter the name of the user to invite:');
    if (userName) {
        const groupId = event.target.getAttribute('data-group-id');
        console.log(groupId);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:3000/invite/${groupId}`,
                { userName },
                {
                    headers: { 'Authorization': token },
                }
            );
            alert('User invited successfully.');
            // Update group users after inviting a member
            await displayGroupUsers(groupId);
        } catch (error) {
            console.log(error);
        }
    }
}


function clearChatMessages() {
    chatMessageElement.innerHTML = ''; // Clear chat messages
}

async function displayGroupUsers(groupId) {
    try {
        const response = await axios.get(
            `http://localhost:3000/getgroupusers/${groupId}`
        );
        const groupUsers = response.data.users;
        const groupUsersContainer = document.getElementById('group-users');
        groupUsersContainer.innerHTML = '';

        for (let i = 0; i < groupUsers.length; i++) {
            const user = groupUsers[i];
            const userElement = document.createElement('div');
            userElement.textContent = user.name;

            if (user.is_admin) {
                // Display "Admin" next to group admins
                const adminLabel = document.createElement('span');
                adminLabel.textContent = '   (Admin)';
                adminLabel.classList.add('admin-label');
                userElement.appendChild(adminLabel);

                // Show the leave group button for admins
                const leaveGroupButton = document.createElement('button');
                leaveGroupButton.textContent = 'Leave Group';
                leaveGroupButton.addEventListener('click', () => {
                    removeGroupMember(user.id);
                });
                userElement.appendChild(leaveGroupButton);
            }

            if (!user.is_admin) {
                // User is not an admin, show the make admin button
                const makeAdminButton = document.createElement('button');
                makeAdminButton.textContent = 'Make Admin';
                makeAdminButton.addEventListener('click', () => {
                    makeGroupMemberAdmin(user.id);
                });
                userElement.appendChild(makeAdminButton);

                // Show the remove button for non-admin users
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.addEventListener('click', () => {
                    removeGroupMember(user.id);
                });
                userElement.appendChild(removeButton);
            }

            groupUsersContainer.appendChild(userElement);
        }
    } catch (error) {
        console.log(error);
    }
}




async function checkGroupMembership(groupId) {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
            `http://localhost:3000/checkgroupmembership/${groupId}`,
            {
                headers: { 'Authorization': token },
            }
        );
        return response.data.isMember;
    } catch (error) {
        console.log(error);
        return false;
    }
}

function displayGroupMessages(messages) {
    chatMessageElement.innerHTML = ''; // Clear chat messages

    messages.forEach((msg) => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${msg.sender}: ${msg.message}`;
        messageElement.setAttribute('data-id', msg.id);
        chatMessageElement.appendChild(messageElement);
    });
}

async function getGroupMessages(groupId) {
    clearChatMessages();
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
            `http://localhost:3000/getgroupmessages/${groupId}`,
            {
                headers: { 'Authorization': token },
            }
        );
        const msg = response.data.messages;
        displayGroupMessages(msg);
    } catch (error) {
        console.log(error);
    }
}

async function enterGroup(event) {
    selectedGroupId = event.target.getAttribute('data-group-id');

    // Check if the user is a member of the group
    const isMember = await checkGroupMembership(selectedGroupId);

    if (isMember) {
        await getGroupMessages(selectedGroupId);
        await displayGroupUsers(selectedGroupId);
    } else {
        alert('You need to be a member of the group to enter.');
    }
}


async function deleteGroup(event) {
    const groupId = event.target.getAttribute('data-group-id');
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/deletegroup/${groupId}`, {
            headers: { 'Authorization': token },
        });
        getGroups(); // Fetch and display the updated group list
    } catch (error) {
        console.log(error);
    }
}

function displayGroups(groups) {
    groupList.innerHTML = '';
    groups.forEach((group) => {
        const listItem = document.createElement('li');
        listItem.textContent = group.name;
        listItem.classList.add('group-item'); // Add a class to the list item

        // Create an "Enter Group" button
        const enterGroupButton = document.createElement('button');
        enterGroupButton.textContent = 'Enter Group';
        enterGroupButton.setAttribute('data-group-id', group.id);
        enterGroupButton.addEventListener('click', enterGroup); // Add event listener for the button

        // Create an "Invite Members" button
        const inviteMembersButton = document.createElement('button');
        inviteMembersButton.textContent = 'Invite Members';
        inviteMembersButton.setAttribute('data-group-id', group.id);
        inviteMembersButton.addEventListener('click', inviteMembers); // Add event listener for the button

        // Create a delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.setAttribute('data-group-id', group.id);
        deleteButton.addEventListener('click', deleteGroup); // Add event listener for the button

        listItem.appendChild(enterGroupButton);
        listItem.appendChild(inviteMembersButton);
        listItem.appendChild(deleteButton);
        groupList.appendChild(listItem);
    });
}

async function getGroups() {
    try {
        const response = await axios.get('http://localhost:3000/getgroup');
        displayGroups(response.data.groups);
    } catch (err) {
        console.log(err);
    }
}

createGroupButton.addEventListener('click', async (e) => {
    e.preventDefault();
    var groupName = groupInput.value;
    try {
        const token = localStorage.getItem('token');
        await axios.post(
            'http://localhost:3000/creategroup',
            { group_name: groupName },
            { headers: { 'Authorization': token } }
        );
        getGroups();
    } catch (err) {
        console.log(err);
    }
});

function displayMessages(messages) {
    chatMessageElement.innerHTML = ''
    messages.forEach((msg) => {
        if (!msg.group_id) {
            // Filter out group messages
            const messageElement = document.createElement('div');
            messageElement.textContent = `${msg.sender}: ${msg.message}`;
            messageElement.setAttribute('data-id', msg.id);
            chatMessageElement.appendChild(messageElement);
        }
    });
}

async function getMessage() {
    try {
        const response = await axios.get('http://localhost:3000/user/getmessage');
        const messages = response.data.messages;
        if (messages.length > 0) {
            displayMessages(messages);
        }
    } catch (err) {
        console.log(err);
    }
}

async function addMessage(message) {
    try {
        const groupId = selectedGroupId; // Get the currently selected group ID

        if (groupId) {
            addGroupMessage(groupId, message);
        } else {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:3000/user/addmessage',
                { message },
                {
                    headers: { 'Authorization': token },
                }
            );
        }
    } catch (err) {
        console.log(err);
    }
}

sendButton.addEventListener('click', (e) => {
    e.preventDefault();

    const message = messageInput.value;

    addMessage(message);

    messageInput.value = '';
});

document.addEventListener('DOMContentLoaded', () => {
    getMessage()
    getGroups();
    getUsers();
});
getMessage()