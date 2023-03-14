const ServerError = require('../interface/Error');
const { uploadToS3 } = require('../utils/uploadPhoto');


const uploadImages = async (req, res, next) => {
  try {
    //check if there images or no
    if(!req.files)
    return next(
      ServerError.badRequest(400, 'add one image at least')
    );
    // wait to images to be uploaded
    const images = await uploadToS3(req.files)
    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
      data : images
    })
  } catch (e) {
    next(e);
  }
}

module.exports = {
  uploadImages
}