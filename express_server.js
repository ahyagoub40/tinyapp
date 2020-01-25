const express = require("express");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'userId',
  keys: ["olive", "cheese"]
}));
app.set("view engine", "ejs");
const { generateRandomString, findUserByEmail, urlForUser } = require('./helpers');
const urlDatabase = {};
const users = {};

const hashedPassword = function(userPassword) {
  return bcrypt.hashSync(userPassword,10);
};
const validatePassword = function(userPassword) {
  return bcrypt.compareSync(userPassword, hashedPassword(userPassword));
};
app.post("/urls", (req, res) => {
  
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]["longURL"] = longURL;
  // this only saves if the user is logged in, is it supposed to remember the user after logging out and in next time/
  urlDatabase[shortURL]["user"] = req.session.userId;
  res.redirect("/urls");
});

// registration, login, logout
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.render("error", {ErrorMessage: "Enter email and/or password", user: null});
  } else if (findUserByEmail(req.body.email, users)) {
    res.render("error", {ErrorMessage: "You already have an account! Login instead",
      user: findUserByEmail(req.body.email, users)});
  } else {
    const newID = generateRandomString();
    const user = {};
    users[newID] = user;
    user.id = newID;
    user.email = req.body.email;
    user.password = hashedPassword(req.body.password);
    req.session.userId = newID;
    res.redirect("/urls");
  }
});
app.post("/login", (req, res) => {
  if (findUserByEmail(req.body.email, users)) {
    if (validatePassword(req.body.password)) {
      req.session.userId = findUserByEmail(req.body.email, users).id;
      res.redirect("/urls");
    } else {
      res.render("error", {ErrorMessage: "incorrect password!", user: findUserByEmail(req.body.email, users)});
    }

  } else {
    res.render("error", {ErrorMessage: "Cannot find email! You might need to register",
      user: findUserByEmail(req.body.email, users)});
  }
});
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  console.log(req.session.userId);
  res.render("urls_login", {user: users[req.session.userId]});
});
app.get("/register", (req, res) => {

  res.render("urls_register", {user: users[req.session.userId]});
});
//
app.get("/", (req, res) => {
  res.send("Hello!");

});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });
app.get("/urls", (req, res) => {
  if (req.session.userId) {
    const userURL = urlForUser(req.session.userId, urlDatabase);
    let templateVars = { urls: userURL,
      user: users[req.session.userId]};
    res.render("urls_index", templateVars);
  } else {
    res.render("error", {ErrorMessage: "login or register, first", user: null});
  }
});
app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!',
    user: req.session.userId};
  res.render("hello_world", templateVars);
});
app.get("/urls/new", (req, res) => {
  if (req.session.userId) {
    let templateVars = {user: users[req.session.userId]};
    res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});
app.get("/urls/:shortURL", (req, res) => {
  if (req.session.userId) {
    const userURL = urlForUser(req.session.userId, urlDatabase);
    if (req.params.shortURL in userURL) {
      let templateVars = { shortURL: req.params.shortURL, longURL: userURL[req.params.shortURL]["longURL"], user: users[req.session.userId]};
      res.render("urls_show", templateVars);
    } else {
      res.render("error", {ErrorMessage: "URL doesn't match the id", user: users[req.session.userId]});
    }
  } else {
    res.render("error", {ErrorMessage: "login or register, first", user: null});
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userURL = urlForUser(req.session.userId, urlDatabase);
  if (req.params.shortURL in userURL) {
    delete userURL[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.render("error", {ErrorMessage: "login or register, first", user: null});
  }
});
app.post("/urls/:shortURL/edit", (req, res) => {
  const userURL = urlForUser(req.session.userId, urlDatabase);
  if (req.params.shortURL in userURL) {
    userURL[req.params.shortURL]["longURL"] = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.render("error", {ErrorMessage: "login or register, first", user: null});
  }
});
app.get("/urls/:shortURL/edit", (req, res) => {

  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user: req.session.userId};
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  if (req.session.userId) {
    const userURL = urlForUser(req.session.userId, urlDatabase);
    if (req.params.shortURL in userURL) {
      res.redirect(userURL[req.params.shortURL]["longURL"]);
    } else {
      res.render("error", {ErrorMessage: "URL doesn't match the id", user: req.session.userId});
    }
  } else {
    res.render("error", {ErrorMessage: "login or register, first", user: null});
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

