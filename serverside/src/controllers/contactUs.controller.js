const ServerError = require('../interface/Error');
const ContactUs = require('../model/contactUs');


const add = async (req, res, next) => {
  try {
    if (req.body.state)
      return next(ServerError.badRequest(401, 'not authorized'))
    if (!req.body.phone && !req.body.email) {
      return next(ServerError.badRequest(400, 'you must add phone or email'))
    }
    const contact = new ContactUs(req.body);
    await contact.save();
    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
    })
  } catch (e) {
    next(e);
  }
}
module.exports = { add };