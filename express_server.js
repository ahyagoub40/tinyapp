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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com",
};
const users = {};
const findUserByEmail = (email) => {
  for (const user of Object.values(users)) {
    if (user.email === email) {
      return user;
    }
  }
};
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(longURL);
});
// app.get("/u/:shortURL", (req, res) => {
//   const longURL = urlDatabase[req.params.shortURL];
//   res.redirect(longURL);
// });

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
app.get("/urls/:shortURL/edit", (req, res) => {

  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});
app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});
app.post("urls/:id", (req, res) => {
  
  res.redirect("/urls_show");
});
// registration, login, logout
app.post("/register", (req, res) => {
  if (req.body.email === ""  || req.body.password === "") {
    res.status(400).end();
  } else if (findUserByEmail()) {
    res.status(400).end();
  } else {
    const newID = generateRandomString();
    const userID = {};
    userID.id = newID;
    users[newID] = userID;
    userID.email = req.body.email;
    userID.password = req.body.password;
    console.log(users);
    res.cookie("userID", userID);
    res.redirect("/urls");
  }
});
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.cookie("password", req.body.password);
  res.redirect("/login");
});
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  let templateVars = {username: req.cookies["username"], password: req.cookies["password"]};
  res.render("urls_login", templateVars);
});
app.get("/register", (req, res) => {
  res.cookie("userID");
  let templateVars = {userID};
  res.render("urls_register", templateVars);
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
  let templateVars = { urls: urlDatabase,
    username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});
app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!',
    username: req.cookies["username"]};
  res.render("hello_world", templateVars);
});
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

