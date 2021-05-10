const mongoose = require("mongoose");

mongoose.Promise = Promise;

const Book = mongoose.model('Book', {
  title: String,
  author: String,
});

module.exports = Book;