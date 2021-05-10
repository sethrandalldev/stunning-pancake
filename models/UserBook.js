const mongoose = require("mongoose");

mongoose.Promise = Promise;

const UserBook = mongoose.model('UserBook', {
  userId: String,
  bookId: String,
  read: Boolean
});

module.exports = UserBook;