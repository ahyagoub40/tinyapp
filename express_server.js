const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");
const generateRandomString = function() {

  let randomString = '';
  
  for (let i = 0; i < 6; i++) {
    let randomAscii = Math.floor((Math.random() * 25) + 97);
    randomString += String.fromCharCode(randomAscii);
  }
  return randomString;
};

const urlDatabase = {};
const users = {};

const findUserByEmail = (email) => {
  for (const user of Object.values(users)) {
    if (user.email === email) {
      return user;
    }
  }
};

const urlForUser = function(id) {
  const userLongURLs = {};
  for (let [key, value] of Object.entries(urlDatabase)) {
    if (value["user"] === id) {
      userLongURLs[key] = value;
    }
  }
  return userLongURLs;
};

app.post("/urls", (req, res) => {
  
  const longURL = req.body.longURL;
  console.log("longURL", longURL);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]["longURL"] = longURL;
  // this only saves if the user is logged in, is it supposed to remember the user after logging out and in next time/
  urlDatabase[shortURL]["user"] = req.cookies["user"];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userURL = urlForUser(req.cookies["user"]);
  if (req.params.shortURL in userURL) {
    delete userURL[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.render("error", {ErrorMessage: "login or register, first", user: null});
  }
});
app.post("/urls/:shortURL/edit", (req, res) => {
  const userURL = urlForUser(req.cookies["user"]);
  if (req.params.shortURL in userURL) {
    userURL[req.params.shortURL]["longURL"] = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.render("error", {ErrorMessage: "login or register, first", user: null});
  }
});
app.get("/urls/:shortURL/edit", (req, res) => {

  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user: req.cookies["user"]};
  res.render("urls_show", templateVars);
});

// registration, login, logout
app.post("/register", (req, res) => {
  if (req.body.email === ""  || req.body.password === "") {
    res.status(400).send("Enter email and password");
  } else if (findUserByEmail(req.body.email)) {
    res.status(400).send("You already have an account!");
  } else {
    const newID = generateRandomString();
    const user = {};
    users[newID] = user;
    user.id = newID;
    user.email = req.body.email;
    user.password = req.body.password;
    console.log(users);
    

    res.cookie("user", newID);
    res.redirect("/urls");
  }
});
app.post("/login", (req, res) => {
  if (findUserByEmail(req.body.email)) {
    console.log(req.cookies["user"]);
    if (req.body.password === users[findUserByEmail(req.body.email).id]["password"]) {
      res.cookie("user", findUserByEmail(req.body.email).id);
      res.redirect("/urls");
    } else {
      res.status(403).send("incorrect password!");
    }

  } else {
    res.status(403).send("Cannot find email!");
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  
  res.render("urls_login", {user: null});
});
app.get("/register", (req, res) => {

  res.render("urls_register", {user: null});
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
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});
app.get("/urls", (req, res) => {
  const user = req.cookies["user"];
  if (user) {
    const userURL = urlForUser(user);
    let templateVars = { urls: userURL,
      user: req.cookies["user"]};
    res.render("urls_index", templateVars);
  } else {
    res.render("error", {ErrorMessage: "login or register, first", user: null});
  }
});
app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!',
    user: req.cookies["user"]};
  res.render("hello_world", templateVars);
});
app.get("/urls/new", (req, res) => {
  if (req.cookies["user"]) {
    let templateVars = {user: req.cookies["user"]};
    res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});
app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies["user"]) {
    const userURL = urlForUser(req.cookies["user"]);
    if (req.params.shortURL in userURL) {
      let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: req.cookies["user"]};
      res.render("urls_show", templateVars);
    } else {
      res.render("error", {ErrorMessage: "URL doesn't match the id", user: req.cookies["user"]});
    }
  } else {
    res.render("error", {ErrorMessage: "login or register, first", user: null});
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

