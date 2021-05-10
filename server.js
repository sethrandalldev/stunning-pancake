const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Book = require('./models/Book');
const UserBook = require('./models/UserBook');

const app = express();

mongoose.Promise = Promise;

const dbUrl = 'mongodb+srv://user:39h89r3@learning-node.lbsjp.mongodb.net/shelfinator?retryWrites=true&w=majority';

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(express.json());

app.post('/login', async(req, res) => {
  User.findOne({email: req.body.email}, (err, user) => {
    bcrypt.compare(req.body.password, user.password, function(err, result) {
      if (result) res.send({ id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName });
      else res.sendStatus(404);
    });
  });
});

app.post('/register', async(req, res) => {
  User.findOne({email: req.body.email}, function (err, user) {
    if (user && Object.keys(user).length) {
      return res.sendStatus(409);
    } else {
      bcrypt.hash(req.body.password, 10, function(err, hash) {
        const user = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: hash
        });
        try {
          user.save().then(savedUser => res.send(savedUser));
        } catch (error) {
          res.sendStatus(500);
          console.error(error);
        }
      });  
    }
  });
});

app.get('/userBooks', async(req, res) => {
  UserBook.find({}, function (err, userBooks) {
    var userBookArray = [];

    userBooks.forEach(function(userBook) {
      userBookArray.push(userBook);
    });

    res.send(userBookArray);
  });
})

app.get('/books', async(req, res) => {
  Book.find({}, function (err, books) {
    var bookArray = [];

    books.forEach(function(book) {
      bookArray.push(book);
    });

    res.send(bookArray);
  });
});

app.post('/books', async(req, res) => {
  User.findById(req.body.userId, function (err, user) {
    Book.findOne({title: req.body.title, author: req.body.author}, function (err, book) {
      if (book && Object.keys(book).length) {
        return res.sendStatus(409);
      } else {
        console.log(user);
        const newBook = new Book({
          title: req.body.title,
          author: req.body.author,
        });
        try {
          newBook.save().then(savedBook => {
            const userBook = new UserBook({
              userId: user._id,
              bookId: savedBook._id,
              read: req.body.read
            });
            try {
              userBook.save().then(savedUserBook => {
                res.send({book: savedBook, userBook: savedUserBook});
              });
            } catch (error) {
              res.sendStatus(500);
              console.error(error);
            }
          });
        } catch (error) {
          res.sendStatus(500);
          console.error(error);
        }
      }
    });
  });
});

mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
  if (err) {
    console.log('mongoose error: ', err);
  }
});

app.listen(4000, () => {
  console.log('The application is listening on port 3000!');
});