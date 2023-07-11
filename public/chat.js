const sendButton = document.getElementById('send-button')
const messageInput = document.getElementById('message-input')


function displayMessages(messages){
    const chatMessageElement=document.getElementById('chat-messages')
    chatMessageElement.innerHTML=""
    messages.forEach(msg=>{
        const messageElement=document.createElement('div')
        messageElement.textContent=`${msg.sender} : ${msg.message}`
        chatMessageElement.appendChild(messageElement)
    })
}

async function getMessage(){
    try{
        const response=await axios.get("http://localhost:3000/user/getmessage")
        let messages=response.data.messages
        displayMessages(messages)
        setTimeout(getMessage, 1000)
    }
    catch(err){
        console.log(err)
    }
}

async function addMessage(message){
    try{
        let msg={
            message
        }
        const token=localStorage.getItem('token')
        await axios.post("http://localhost:3000/user/addmessage",msg,{headers:{'Authorization':token}}) 
    }
    catch(err){
        console.log(err)
    }
}

sendButton.addEventListener('click',(e)=>{
    e.preventDefault()

    let message=messageInput.value
    
    addMessage(message)

    messageInput.value=""
})
getMessage()
