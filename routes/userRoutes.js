const express=require('express')
const controller=require('../controllers/userController')

const router=express.Router()

router.post('/user/signup',controller.signup)

router.post('/user/login',controller.login)

module.exports=router