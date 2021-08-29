const mongoose = require("mongoose");

mongoose.Promise = Promise;

const Notebook = mongoose.model("Notebook", {
  userId: String,
  title: String,
  description: String,
  pages: [String],
});

module.exports = Notebook;
