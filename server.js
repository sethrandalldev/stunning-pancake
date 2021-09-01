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
  User.findOne({ email: req.body.email }, (err, user) => {
    bcrypt.compare(req.body.password, user.password, (err, result) => {
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
  User.findOne({ email: req.body.email }, (err, user) => {
    if (user && Object.keys(user).length) {
      return res.sendStatus(409);
    } else {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
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
  Page.find({ notebookId: req.params.notebookId }, (err, pages) => {
    res.send(pages);
  });
});

app.get("/notebooks/:userId", async (req, res) => {
  Notebook.find({ userId: req.params.userId }, (err, notebooks) => {
    res.send(notebooks);
  });
});

app.delete("/notebooks/:id", async (req, res) => {
  Notebook.findByIdAndDelete(req.params.id, (err, docs) => {
    if (err) {
      console.error(err);
    } else {
      res.sendStatus(200);
    }
  });
});

app.put("/pages", async (req, res) => {
  Page.findByIdAndUpdate(
    req.body.id,
    { title: req.body.title, body: req.body.body },
    (err, page) => {
      if (err) {
        console.error(err);
      } else {
        page.save().then(() => res.sendStatus(200));
      }
    }
  );
});

app.post("/pages/:notebookId", async (req, res) => {
  const page = new Page({
    title: "",
    body: "",
    notebookId: req.params.notebookId,
  });
  page.save().then(() => {
    Notebook.findByIdAndUpdate(
      req.params.notebookId,
      { $push: { pages: page._id } },
      (err, notebook) => {
        notebook.save().then(() => res.status(200).send(page));
      }
    );
  });
});

app.post("/notebooks", async (req, res) => {
  const userId = req.body.userId;
  Notebook.findOne({ title: req.body.title, userId }, (err, notebook) => {
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
        (err, user) => {
          try {
            user.save().then(() => {
              const page = new Page({
                title: "First Page",
                body: "",
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
      console.error(err);
    } else {
      console.log("mongoose connected");
    }
  }
);

app.listen(4000, () => {
  console.log("The application is listening on port 4000!");
});
