const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatBox = document.querySelector('.chat-box');
const usersList = document.querySelector('.users-list');
const createGroupButton = document.getElementById('create-group-button')
const groupNameInput = document.getElementById('group-name-input')
const groupsList = document.querySelector('.groups-list');
const fileInput = document.getElementById('file-input');


let selectedGroupId = null;

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('connected');
});

sendButton.addEventListener('click', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    sendMessage(message);
    messageInput.value = '';
});

async function sendMessage(message) {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/getUserIdName', {
        headers: { 'Authorization': token }
    });

    const msg = {
        message: message,
        sender: response.data.name,
        groupId: selectedGroupId
    };
    socket.emit('message', msg);
    displayMessage(msg, 'outgoing');
    addMessage(msg);
}


socket.on('message', (msg) => {
    displayMessage(msg, 'incoming');
});

function displayMessage(msg, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');

    if (isURL(msg.message)) {
        const linkElement = document.createElement('a');
        linkElement.href = msg.message;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.innerText = `${msg.sender}: ${msg.message}`;

        messageContent.appendChild(linkElement);
    } else {
        messageContent.innerText = `${msg.sender}: ${msg.message}`;
    }

    messageElement.appendChild(messageContent);
    chatBox.appendChild(messageElement);
}

function isURL(message) {
    return message.startsWith('http://') || message.startsWith('https://');
}


async function addMessage(msg) {
    try {
        const groupId = selectedGroupId;
        if (groupId) {
            addGroupMessage(groupId, msg)
        }
        else {
            const token = localStorage.getItem('token')
            await axios.post('http://localhost:3000/user/addmessage', msg, { headers: { 'Authorization': token } })
        }
    }
    catch (err) {
        console.log(err)
    }
}

async function getMessage() {

    const response = await axios.get('http://localhost:3000/user/getmessage');
    const msg = response.data.messages
    console.log(msg)
    const token = localStorage.getItem('token');
    const currentUser = await axios.get('http://localhost:3000/getUserIdName', {
        headers: { 'Authorization': token }
    });
    const sender = currentUser.data.name;


    for (var i = 0; i < msg.length; i++) {

        if (sender === msg[i].sender) {
            displayMessage(msg[i], 'outgoing')
        }
        else {
            displayMessage(msg[i], 'incoming')
        }

    }
}

async function getUsers() {
    try {
        const token = localStorage.getItem('token');
        const currentUser = await axios.get('http://localhost:3000/getUserIdName', {
            headers: { 'Authorization': token }
        });
        const currentUserName = currentUser.data.name;

        const response = await axios.get('http://localhost:3000/getusers');
        const users = response.data.users;

        for (let i = 0; i < users.length; i++) {
            const user = users[i];

            if (user.name === currentUserName) {
                user.isCurrentUser = true; // Add isCurrentUser flag for the current user
            }

            const userElement = document.createElement('div');
            userElement.classList.add('user');
            userElement.innerText = user.name;

            // Create "Delete User" button only for users other than the current user
            if (!user.isCurrentUser) {
                const deleteUserButton = document.createElement('button');
                deleteUserButton.innerText = 'Delete User';
                deleteUserButton.setAttribute('data-user-id', user.id);
                deleteUserButton.addEventListener('click', deleteUser);
                userElement.appendChild(deleteUserButton);
            }

            usersList.appendChild(userElement);
        }
    } catch (error) {
        console.log(error);
    }
}



async function deleteUser(event) {
    try {
        const userId = event.target.getAttribute('data-user-id');
        console.log(userId)
        const confirmDelete = confirm('Are you sure you want to delete this user?');
        if (confirmDelete) {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/deleteuser/${userId}`, {
                headers: { 'Authorization': token },
            });
            alert('User deleted successfully');
            // Refresh the user list after deleting the user
            usersList.innerHTML = '';
            getUsers();
        }
    } catch (error) {
        console.log(error);
    }
}

createGroupButton.addEventListener('click', async (e) => {
    e.preventDefault()
    const groupName = groupNameInput.value.trim()
    try {
        const token = localStorage.getItem('token');
        await axios.post(
            'http://localhost:3000/creategroup',
            { group_name: groupName },
            { headers: { 'Authorization': token } }
        );
        alert("Group created successfully")
        groupNameInput.value = ""
        getGroups();
    } catch (err) {
        console.log(err);
    }
})

async function getGroups() {
    try {
        const response = await axios.get('http://localhost:3000/getgroup');
        displayGroups(response.data.groups);
    } catch (err) {
        console.log(err);
    }
}

function displayGroups(groups) {
    groupsList.innerHTML = ''; // Clear the existing list

    const groupsListHeading = document.createElement('h2');
    groupsListHeading.classList.add('groups-list-heading');
    groupsListHeading.innerText = 'Groups';
    groupsList.appendChild(groupsListHeading);

    for (let i = 0; i < groups.length; i++) {
        const groupElement = document.createElement('div');
        groupElement.classList.add('group');
        groupElement.innerText = `${groups[i].name} :`;

        // Create "Enter Group" button
        const enterGroupButton = document.createElement('button');
        enterGroupButton.innerText = 'Enter Group';
        enterGroupButton.setAttribute('data-group-id', groups[i].id);
        enterGroupButton.addEventListener('click', enterGroup);
        groupElement.appendChild(enterGroupButton);

        // Create "Invite Member" button
        const inviteMemberButton = document.createElement('button');
        inviteMemberButton.innerText = 'Invite Member';
        inviteMemberButton.setAttribute('data-group-id', groups[i].id);
        inviteMemberButton.addEventListener('click', inviteMember);
        groupElement.appendChild(inviteMemberButton);

        // Create "Delete Group" button
        const deleteGroupButton = document.createElement('button');
        deleteGroupButton.innerText = 'Delete Group';
        deleteGroupButton.setAttribute('data-group-id', groups[i].id);
        deleteGroupButton.addEventListener('click', deleteGroup);
        groupElement.appendChild(deleteGroupButton);

        groupsList.appendChild(groupElement);
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

async function inviteMember(event) {
    try {
        const groupId = event.target.getAttribute('data-group-id');
        const isMember = await checkGroupMembership(groupId);

        if (isMember) {
            const isAdmin = await checkAdminStatus(groupId);

            if (isAdmin) {
                const userName = prompt('Enter the name of the user to invite:');
                if (userName) {
                    console.log(groupId);

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
                }
            } else {
                alert('You need to be an admin to invite members.');
            }
        } else {
            alert('You have to be a member to invite people.');
        }
    } catch (error) {
        console.log(error);
    }
}

async function deleteGroup(event) {
    try {
        const groupId = event.target.getAttribute('data-group-id');
        const isMember = await checkGroupMembership(groupId);
        if (isMember) {
            const isAdmin = await checkAdminStatus(groupId);

            if (isAdmin) {
                const confirmDelete = confirm('Are you sure you want to delete the group?');
                if (confirmDelete) {
                    const token = localStorage.getItem('token');
                    await axios.delete(`http://localhost:3000/deletegroup/${groupId}`, {
                        headers: { 'Authorization': token },
                    });
                    getGroups();
                }
            } else {
                alert('You need to be an admin to delete the group.');
            }
        } else {
            alert('You have to be a member to delete the group.');
        }
    } catch (error) {
        console.log(error);
    }
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

function clearChatMessages() {
    chatBox.innerHTML = ''; // Clear chat messages
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
        console.log(response)
        const msg = response.data.messages;
        displayGroupMessages(msg);
    } catch (error) {
        console.log(error);
    }
}

async function displayGroupMessages(messages) {
    const token = localStorage.getItem('token');
    const currentUser = await axios.get('http://localhost:3000/getUserIdName', {
        headers: { 'Authorization': token }
    });
    const sender = currentUser.data.name;

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        if (message.sender === sender) {
            messageElement.classList.add('outgoing');
        } else {
            messageElement.classList.add('incoming');
        }

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');

        if (isURL(message.message)) {
            const linkElement = document.createElement('a');
            linkElement.href = message.message;
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            linkElement.innerText = `${message.sender}: ${message.message}`;

            messageContent.appendChild(linkElement);
        } else {
            messageContent.innerText = `${message.sender}: ${message.message}`;
        }

        messageElement.appendChild(messageContent);
        chatBox.appendChild(messageElement);
    }
}

async function checkAdminStatus(groupId) {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
            `http://localhost:3000/checkadminstatus/${groupId}`,
            {
                headers: { 'Authorization': token },
            }
        );

        return response.data.isAdmin;
    } catch (error) {
        console.log(error);
        return false;
    }
}

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const link = await uploadFile(file);
    sendMessage(link)
})

async function uploadFile(file) {
    const token = localStorage.getItem('token')
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post('http://localhost:3000/upload', formData, { headers: { 'Authorization': token } })
    console.log(response.data.name)
    return response.data.result.Location

}

document.addEventListener('DOMContentLoaded', () => {
    getMessage()
    getUsers()
    getGroups()

})
