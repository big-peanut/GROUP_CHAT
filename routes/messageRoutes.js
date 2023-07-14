const express=require('express')
const userauthenticate=require('../middleware/auth')
const messageController=require('../controllers/messageController')

const router=express.Router()

router.post('/user/addmessage',userauthenticate.authenticate,messageController.addMessage)
router.get('/user/getmessage',messageController.getMessage)
router.post('/addgroupmessage/:groupId', userauthenticate.authenticate, messageController.addGroupMessage)
router.get('/getgroupmessages/:groupId',userauthenticate.authenticate,messageController.getGroupMessages)

module.exports=router