const dotenv = require('dotenv');
dotenv.config();
const {
  PORT,
  SENDGRID_EMAIL,
  SENDGRID_API_KEY,
  AWS_BUCKET_NAME,
  AWS_BUCKET_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY
} = process.env
module.exports = {
  port: PORT,
  sendgridApiKey: SENDGRID_API_KEY,
  sendgridEmail: SENDGRID_EMAIL,
  awsBucketName  : AWS_BUCKET_NAME,
  awsBucketRegion:AWS_BUCKET_REGION,
  awsAccessKey : AWS_ACCESS_KEY_ID,
  awsSecretKey : AWS_SECRET_ACCESS_KEY,
}