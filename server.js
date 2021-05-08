const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();

mongoose.Promise = Promise;

const dbUrl = 'mongodb+srv://user:39h89r3@learning-node.lbsjp.mongodb.net/weather?retryWrites=true&w=majority';

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(express.json());

app.post('/login', async(req, res) => {
  User.findOne({email: req.body.email}, (err, user) => {
    bcrypt.compare(req.body.password, user.password, function(err, result) {
      if (result) res.send({ id: user._id, email: user.email, name: user.name });
      else res.sendStatus(404);
    });
  });
});

app.post('/register', async(req, res) => {
  Object.keys(req).forEach(key => console.log(key));
  User.findOne({email: req.body.email}, function (err, user) {
    if (user && Object.keys(user).length) {
      return res.sendStatus(409);
    } else {
      bcrypt.hash(req.body.password, 10, function(err, hash) {
        const user = new User({
          name: req.body.name,
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

mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
  if (err) {
    console.log('mongoose error: ', err);
  }
});

app.listen(4000, () => {
  console.log('The application is listening on port 3000!');
});