const express=require('express')
const controller=require('../controllers/userController')
const userAuthenticate=require('../middleware/auth')

const router=express.Router()

router.post('/user/signup',controller.signup)

router.post('/user/login',controller.login)

router.get('/getusers',controller.getUsers)

router.get('/getUserIdName',userAuthenticate.authenticate,controller.getUserIdName)

router.delete('/deleteuser/:userId',userAuthenticate.authenticate,controller.deleteUser)

module.exports=router