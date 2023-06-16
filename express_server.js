const express = require("express");

const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // L.173
app.use(express.urlencoded({ extended: true })); //body-parser L.180

app.use(cookieParser());
app.use(morgan('dev'));


// Functions and Storage
const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x10000000).toString(16).substring(1);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};



/* *** ROUTES *** */

app.get("/", (req, res) => {
  res.send("Hello!");
});

//1
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// let templateVars = {
//   user: users[req.cookie["user_id"]],
// };

//L.173  hello_world.ejs
app.get("/hello", (req, res) => {
  //    ^^^^^^^^ localhost:8080/hello
  const userObject = users[req.cookies.userId];
  const templateVars = {
    greeting: "hey bob",
    userId: userObject,
  };
  
  //        ^^^ set templateVars to obj with greeting key(go to ejs1)
  res.render("hello_world", templateVars);
  //        (hello_world.ejs, passing in templateVars);
});

//3 INDEX.ejs L.173
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: users[req.cookies.userId],
  };
  res.render("urls_index", templateVars);
});

//NEW.ejs L.180: routes should be from most specific to least specific
app.get("/urls/new", (req, res) => {
  const templateVars = {
    userId: users[req.cookies.userId],
  };
  res.render("urls_new", templateVars);
});

//SHOW.ejs L.173
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    userId: users[req.cookies.userId],
  };
  res.render("urls_show", templateVars);
});

//Registration-USer Registration Form
app.get("/register", (req, res) => {
  const templateVars = {
    userId: users[req.cookies.userId],
  };
  res.render("urls_registration", templateVars);
});






// L.180 Makes Key(shortURL) : Value(longURL) & adds to urlDatabase
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(shortURL), console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});


// L.171 Redirects from /u/:id to actual site.
app.get("/u/:id", (req, res) => {
  // console.log(urlDatabase[req.params.id]);
  const longURL = urlDatabase[req.params.id];
  console.log(longURL);
  res.redirect(longURL);
});

//Delete L485
app.post("/urls/:id/delete", (req, res) => {
  // const shortURL = req.params.id;
  // const longURL = urlDatabase[shortURL];
  // console.log(`Deleted: ${shortURL}: ${longURL}`);
  console.log(req.params.id);
  delete urlDatabase[req.params.id];
  console.log(urlDatabase);
  res.redirect("/urls");
});

//Edit
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  console.log(req.body);
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

//Login
app.post("/login", (req, res) => {
  // console.log(req.body);
  console.log(req.body.userId);
  const userId = req.body.userId;
  res.cookie("userId", userId);
  console.log(userId);
  res.redirect("/urls");
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  res.redirect('/urls');
});

//Register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = generateRandomString();
 
  users[userId] = {
    id: userId,
    email: email,
    password: password,
  };
  console.log(users);
  res.cookie("userId", users[userId].id);
  console.log(users[userId]);
  res.redirect("/urls");
});





//Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//<% include ./partials/_header %>
