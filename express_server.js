const express = require("express");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['Welcome', 'to', 'the', 'hotel', 'California'],

  maxAge: 24 * 60 * 60 * 1000
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userId: "anthony",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "anthony",
  },
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "anthony": {
    id: 'anthony',
    email: 'anthony@gmail.com',
    password: '123'
  },
};
const { generateRandomString, getUserByEmail, urlsForUser, userIsLoggedIn,cookieUserMatch } = require("./helpers");

//**Routes **//
app.get("/", (req, res) => {
  if (cookieUserMatch(req.session.userId, users)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//JSON
app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

//Index.ejs
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.userId, urlDatabase),
    userId: users[req.session.userId],
  };
  res.render("urls_index", templateVars);
});

//New.ejs
app.get("/urls/new", (req, res) => {
  if ((userIsLoggedIn(req.session.userId, users)) === false) {
    res.redirect("/login");
  } else {
    const templateVars = {
      userId: users[req.session.userId],
    };
    res.render("urls_new", templateVars);
  }
});

//Show.ejs
app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      userId: users[req.session.userId],
      user: users[req.session.userId].id,
      userURL: urlDatabase[req.params.id].userId,
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("Your URLS do not match");
  }
  
});

//ShortURL
app.post("/urls", (req, res) => {
  if (req.session.userId) {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {
      longURL: longURL,
      userId: req.session.userId,
    };
    res.redirect("/urls");
  } else {
    res.send("Sorry, you can't do that right now");
  }
});

//u/:id
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    if (longURL === undefined) {
      res.status(400).send("Sorry, we can't find that page in our records.");
    } else {
      res.redirect(longURL);
    }
  } else {
    res.send("Sorry, this link doesn't appear to be available.");
  }
});

//Delete
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.userId;
  const userUrls = urlsForUser(userId, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.send("You don't have permission to do this");
  }
});

//Edit
app.post("/urls/:id/edit", (req, res) => {
  const userId = req.session.userId;
  const userUrls = urlsForUser(userId, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to edit this short URL.");
  }
});

//Redirect
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

//Login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('Please provide an email AND a password');
  }
  let foundUser = null;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }
  if (!foundUser) {
    return res.status(400).send('No user with this email');
  }
  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(400).send('Passwords do not match');
  }
  req.session.userId = foundUser.id;
  res.redirect('/urls');
});

//Login.ejs
app.get("/login", (req, res) => {
  if (cookieUserMatch(req.session.userId, users)) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      userId: users[req.session.userId],
    };
    res.render("urls_login", templateVars);
  }
});

//Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//Register.ejs
app.get("/register", (req, res) => {
  if (userIsLoggedIn(req.session.userId, users)) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      userId: users[req.session.userId],
    };
    res.render("urls_registration", templateVars);
  }
});

//Register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Oops, credentials are incorrect1");
  } else if (getUserByEmail(email, users)) {
    return res.status(400).send("This email already has an account.");
  } else {
    const userId = generateRandomString();
    const salt = bcrypt.genSaltSync(10);
    const newPass = bcrypt.hashSync(password, salt);
    users[userId] = {
      id: userId,
      email: email,
      password: newPass,
    };
    req.session.userId = users[userId].id;
    console.log(users[userId]);
    return res.redirect("/urls");
  }
});

//Listener
app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}!`);
});