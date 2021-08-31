const mongoose = require("mongoose");

mongoose.Promise = Promise;

const User = mongoose.model("User", {
  firstName: String,
  lastName: String,
  email: String,
  password: String,
});

module.exports = User;
