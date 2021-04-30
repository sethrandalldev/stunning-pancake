const mongoose = require("mongoose");

mongoose.Promise = Promise;

const User = mongoose.model('User', {
  email: String,
  password: String,
  location: String
});

module.exports = User;