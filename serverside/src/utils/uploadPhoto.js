const multer = require('multer')
const S3 = require('aws-sdk/clients/s3')
const fs = require('fs')
const path = require('path')
const config = require('../../config')

// aws variables
const awsBucketName = config.awsBucketName
const awsBucketRegion = config.awsBucketRegion
const awsAccessKey = config.awsAccessKey
const awsSecretKey = config.awsSecretKey

const s3 = new S3({
  awsBucketRegion,
  awsAccessKey,
  awsSecretKey
})
const uploadToS3 = async files =>{

  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${Date.now().toString()}-${file.originalname}`,
      Body: file.buffer,
      ContentType : file.mimetype,
    };
  });

  return await Promise.all(params.map((param) => s3.upload(param).promise().then(res => res.Location)));
}
const Uploads = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/.(jpg|jpeg|png|jfif)$/))
      return cb(new Error('please upload image !'))
    cb(null, true)
  },
})

//upload single image
// const uploadToS3 = async file =>{
//   // change filename to be unique
//   const fileName = Date.now().toString() + "" + file.originalname
//   const uploadParams ={
//     Bucket : awsBucketName , 
//     Body : file.buffer,
//     Key : fileName,
//     ContentType : file.mimetype
//   }
//   const req = await s3.upload(uploadParams).promise();
//   return req;
// }
//old way to upload on the server
// const Uploads = multer({
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/.(jpg|jpeg|png|jfif)$/))
//       return cb(new Error('please upload image !'))
//     cb(null, true)
//   },
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       const fullPath = path.join(__dirname, '../uploads')
//       cb(null, fullPath)
//     },
//     filename: (req, file, cb) => {
//       console.log(req.body);
//       const fileName = Date.now().toString() + "" + file.originalname
//       cb(null, fileName)
//     }
//   }),
// })
module.exports = {uploadToS3 , Uploads};