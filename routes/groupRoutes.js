const express=require('express')
const userauthenticate=require('../middleware/auth')
const groupController=require('../controllers/groupController')

const router=express.Router()

router.post('/creategroup',userauthenticate.authenticate,groupController.createGroup)
router.get('/getgroup',groupController.getGroups)
router.delete('/deletegroup/:group_id',userauthenticate.authenticate,groupController.deleteGroup)
router.post('/invite/:group_id', userauthenticate.authenticate, groupController.inviteMemberToGroup)


module.exports=router