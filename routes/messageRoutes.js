const express=require('express')
const userauthenticate=require('../middleware/auth')
const messageController=require('../controllers/messageController')

const router=express.Router()

router.post('/user/message',userauthenticate.authenticate,messageController.addMessage)

module.exports=router