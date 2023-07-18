const express = require('express')
const userauthenticate = require('../middleware/auth')
const messageController = require('../controllers/messageController')
const multer = require('multer')
const {s3Upload} = require('../services/s3Services')


const router = express.Router()

router.post('/user/addmessage', userauthenticate.authenticate, messageController.addMessage)
router.get('/user/getmessage', messageController.getMessage)
router.post('/addgroupmessage/:groupId', userauthenticate.authenticate, messageController.addGroupMessage)
router.get('/getgroupmessages/:groupId', userauthenticate.authenticate, messageController.getGroupMessages)



const storage = multer.memoryStorage()

const upload = multer({ storage })
router.post('/upload', upload.array('file'),userauthenticate.authenticate, async (req, res) => {
    try {
        const file = req.files[0];
        const result = await s3Upload(file); // Wait for the s3Upload function to complete
        res.json({ status: 'success', result, name: req.user.name});
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', error: 'File upload failed' });
    }
});


module.exports = router