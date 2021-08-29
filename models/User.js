const mongoose = require("mongoose");

mongoose.Promise = Promise;

const User = mongoose.model("User", {
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  notebooks: [String],
});

module.exports = User;
