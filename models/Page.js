const mongoose = require("mongoose");

mongoose.Promise = Promise;

const Page = mongoose.model("Page", {
  title: String,
  body: String,
  notebookId: String,
});

module.exports = Page;
