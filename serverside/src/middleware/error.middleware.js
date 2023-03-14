const ServerError = require("../interface/Error");

const errorMiddleWare = (err, req, res, next) => {
  // console.log(err)
  // const err = JSON.parse(err);
  // console.log(err)
  // if(err instanceof ServerError)
  // console.log(err)
  let status = err.statusCode || 500;
  let message = err.message || 'something went wrong';

  // console.log(err.name)
  // mongoose duplicate key error
  if (err.code === 11000) {
    status = 400;
    message = `duplicate ${Object.keys(err.keyValue)} entered`
  }
  if (err.name === 'ValidationError') {
    status = 400;
  }
  res.status(status).json({
    ok: false,
    status,
    message
  })
}
module.exports = errorMiddleWare;