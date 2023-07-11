const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');

const MAX_STORED_CHATS = 10; // Maximum number of chats to store in local storage

let lastMsgId = 0; // Last retrieved message ID

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
});
