const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Notebook = require("./models/Notebook");
const Page = require("./models/Page");

const app = express();

mongoose.Promise = Promise;

const dbUrl =
  "mongodb+srv://sethrandall:7V5ioK7exqiIVu4V@cluster0.axpxs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.post("/login", async (req, res) => {
  console.log(req.body);
  User.find({}, function (err, users) {
    users.forEach(function (user) {
      console.log(user);
    });
  });
  User.findOne({ email: req.body.email }, (err, user) => {
    console.log(user);
    bcrypt.compare(req.body.password, user.password, function (err, result) {
      if (result)
        res.send({
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      else res.sendStatus(404);
    });
  });
});

app.post("/register", async (req, res) => {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (user && Object.keys(user).length) {
      return res.sendStatus(409);
    } else {
      bcrypt.hash(req.body.password, 10, function (err, hash) {
        const user = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: hash,
        });
        try {
          user.save().then((savedUser) => res.send(savedUser));
        } catch (error) {
          res.sendStatus(500);
          console.error(error);
        }
      });
    }
  });
});

app.get("/pages/:notebookId", async (req, res) => {
  Page.find({ notebookId: req.params.notebookId }, function (err, pages) {
    res.send(pages);
  });
});

app.get("/notebooks/:userId", async (req, res) => {
  Notebook.find({ userId: req.params.userId }, function (err, notebooks) {
    console.log(notebooks);
    res.send(notebooks);
  });
});

app.post("/page", async (req, res) => {});

app.delete("/notebooks/:id", async (req, res) => {
  Notebook.findByIdAndDelete(req.params.id, function (err, docs) {
    if (err) {
      console.error(err);
    } else {
      res.sendStatus(200);
    }
  });
});

app.post("/notebooks", async (req, res) => {
  const userId = req.body.userId;
  Notebook.findOne({ title: req.body.title, userId }, function (err, notebook) {
    if (notebook && Object.keys(notebook).length) {
      return res.sendStatus(409);
    } else {
      const notebook = new Notebook({
        title: req.body.title,
        description: req.body.description,
        userId,
        pages: [],
      });
      User.findByIdAndUpdate(
        userId,
        { $push: { notebooks: notebook._id } },
        function (err, user) {
          try {
            user.save().then(() => {
              const page = new Page({
                title: "First Page",
                description: "",
                notebookId: notebook._id,
              });
              notebook.pages.push(page._id);
              page.save().then((savedPage) => {
                notebook
                  .save()
                  .then((savedNotebook) => res.send(savedNotebook));
              });
            });
          } catch (error) {
            res.sendStatus(500);
            console.error(error);
          }
        }
      );
    }
  });
});

mongoose.connect(
  dbUrl,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.log("mongoose error: ", err);
    } else {
      console.log("mongoose connected");
    }
  }
);

app.listen(4000, () => {
  console.log("The application is listening on port 4000!");
});
