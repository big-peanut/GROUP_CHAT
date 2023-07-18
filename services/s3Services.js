const AWS = require("aws-sdk")
const dotenv = require('dotenv')
const uuid = require("uuid").v4

dotenv.config()

const s3Upload = (file) => {

    const BUCKET_NAME = process.env.AWS_BUCKET_NAME
    const AWS_USER_KEY = process.env.AWS_ACCESS_KEY
    const AWS_USER_SECRET = process.env.AWS_SECRET_KEY

    const s3 = new AWS.S3({
        accessKeyId: AWS_USER_KEY,
        secretAccessKey: AWS_USER_SECRET,
        Bucket: BUCKET_NAME,
        ACL: 'public-read'
    })

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${file.originalname}`,
        Body: file.buffer,
    }
    return s3.upload(params).promise()
}

module.exports={
    s3Upload
}