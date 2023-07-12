const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');
const createGroupButton = document.getElementById('create-group-button')
const groupInput = document.getElementById('group-input')
const groupList = document.getElementById('group-list')

const MAX_STORED_CHATS = 10; // Maximum number of chats to store in local storage

let lastMsgId = 0; // Last retrieved message ID

function displayUsers(users) {
    const userListElement = document.getElementById('user-list');
    userListElement.innerHTML = '';

    for (let i = 0; i < users.length; i++) {
        const userElement = document.createElement('div');
        userElement.textContent = users[i].name;

        userListElement.appendChild(userElement);
    }
}

async function getUsers() {
    const response = await axios.get('http://localhost:3000/getusers')
    displayUsers(response.data.users)
}

function inviteMembers() {
    const userName = prompt('Enter the name of the user to invite:');
    if (userName) {
        const groupId = event.target.getAttribute('data-group-id');
        console.log(groupId)
        try {
            const token = localStorage.getItem('token');
            axios.post(`http://localhost:3000/invite/${groupId}`, { userName }, {
                headers: { 'Authorization': token },
            });
            alert('User invited successfully.');
        } catch (error) {
            console.log(error);
        }
    }
}


function enterGroup() {
    console.log("hello")
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
        const response = await axios.get('http://localhost:3000/getgroup')
        displayGroups(response.data.groups)
    }
    catch (err) {
        console.log(err)
    }
}

createGroupButton.addEventListener('click', async (e) => {
    e.preventDefault()

    var groupName = groupInput.value
    try {
        const token = localStorage.getItem('token')
        await axios.post('http://localhost:3000/creategroup', { group_name: groupName }, { headers: { 'Authorization': token } })
        getGroups()
    }
    catch (err) {
        console.log(err)
    }
})

function displayMessages(messages) {
    const chatMessageElement = document.getElementById('chat-messages');
    messages.forEach((msg) => {
        const existingMessage = chatMessageElement.querySelector(`[data-id="${msg.id}"]`);
        if (!existingMessage) {
            const messageElement = document.createElement('div');
            messageElement.textContent = `${msg.sender}: ${msg.message}`;
            messageElement.setAttribute('data-id', msg.id);
            chatMessageElement.appendChild(messageElement);
        }
    });
}

async function getMessage() {
    try {
        const url = `http://localhost:3000/user/getmessage?lastmsgid=${lastMsgId}`;
        const response = await axios.get(url);
        const messages = response.data.messages;
        if (messages.length > 0) {
            lastMsgId = messages[messages.length - 1].id; // Update the last retrieved message ID
            displayMessages(messages);
            updateLocalChats(messages);
        }
        setTimeout(getMessage, 1000);
    } catch (err) {
        console.log(err);
    }
}

async function addMessage(message) {
    try {
        let msg = {
            message,
        };
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:3000/user/addmessage', msg, {
            headers: { Authorization: token },
        });
    } catch (err) {
        console.log(err);
    }
}

function updateLocalChats(messages) {
    let storedChats = getLocalChats();
    messages.forEach((msg) => {
        const existingChat = storedChats.find((chat) => chat.id === msg.id);
        if (!existingChat) {
            storedChats.push(msg);
        }
    });
    if (storedChats.length > MAX_STORED_CHATS) {
        storedChats = storedChats.slice(storedChats.length - MAX_STORED_CHATS);
    }
    localStorage.setItem('chats', JSON.stringify(storedChats));
}

function getLocalChats() {
    const storedChats = localStorage.getItem('chats');
    if (storedChats) {
        return JSON.parse(storedChats);
    }
    return [];
}

sendButton.addEventListener('click', (e) => {
    e.preventDefault();

    const message = messageInput.value;

    addMessage(message);

    messageInput.value = '';
});

document.addEventListener('DOMContentLoaded', () => {
    const storedChats = getLocalChats();
    if (storedChats.length > 0) {
        lastMsgId = storedChats[storedChats.length - 1].id;
        displayMessages(storedChats);
    }
    getMessage();
    getGroups()
    getUsers()
});
