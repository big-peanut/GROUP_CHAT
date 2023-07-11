const Messages=require('../models/message')
const Users=require('../models/user')
const sequelize=require('../util/db')

exports.addMessage=async(req,res,next)=>{
    try{
        const msg=req.body.message
        const data=await Messages.create({
            message:msg,
            user_id:req.user.id
        })
        res.json({datavalues:data})
    }
    catch(err){
        console.log(err)
    }
}