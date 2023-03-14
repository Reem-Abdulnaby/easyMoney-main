const mongoose = require('mongoose');
const ServerError = require('../interface/Error');
const connectDatabase = async () => {
  // mongoose.connect('mongodb://127.0.0.1:27017/Eazy_Mony');
  try {
    await mongoose.connect(`mongodb+srv://root:hamed123456@eazymoney.qyup23h.mongodb.net/?retryWrites=true&w=majority`)
  } catch (e) {
    console.error(e.message)
  }
}
module.exports = connectDatabase;