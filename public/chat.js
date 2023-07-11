const sendButton = document.getElementById('send-button')
const messageInput = document.getElementById('message-input')

async function addMessage(message){
    try{
        let msg={
            message
        }
        const token=localStorage.getItem('token')
        await axios.post("http://localhost:3000/user/message",msg,{headers:{'Authorization':token}})
        
    }
    catch(err){
        console.log(err)
    }
}

sendButton.addEventListener('click',(e)=>{
    e.preventDefault()

    let message=messageInput.value
    
    addMessage(message)

    message=""
})