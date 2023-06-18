const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const PORT = 8080;

const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.body object

// const salt = bcrypt.genSaltSync(10);
// const hashedPassword = bcrypt.hashSync(password, salt);

// const results = bcrypt.compareSync(password, hashedPassword);

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

// Functions and Storage

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
  anthony: {
    id: 'anthony',
    email: 'anthony@gmail.com',
    password: '123',
  },
};
const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x10000000).toString(16).substring(1);
};
const emailUserMatch = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

//return list of 
const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
      console.log(urlDatabase[shortURL].userId);
      console.log(id);
    }
  }
  return userUrls;
};

const userIsLoggedIn = (userId, users) => {
  for (const user in users) {
    if (userId === user) {
      return true;
    }
  } return false;
};
const cookieUserMatch = function(cookie, userDatabase) {
  for (const user in userDatabase) {
    if (cookie === user) {
      return true;
    }
  } return false;
};

/* *** ROUTES *** */
app.get("/", (req, res) => {
  if (cookieUserMatch(req.cookies.userId, users)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//JSON
app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

//Render: index.ejs
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.cookies.userId, urlDatabase),
    userId: users[req.cookies.userId],
  };
  res.render("urls_index", templateVars);
});

//Render: new.ejs
app.get("/urls/new", (req, res) => {
  if ((userIsLoggedIn(req.cookies.userId, users)) === false) {
    res.redirect("/login");
  } else {
    const templateVars = {
      userId: users[req.cookies.userId],
    };
    res.render("urls_new", templateVars);
  }
});

//Render: show.ejs
app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      userId: users[req.cookies.userId],
      user: users[req.cookies.userId].id,
      userURL: urlDatabase[req.params.id].userId,
    };
    console.log(templateVars.userId);
    console.log(templateVars.userURL);
    res.render("urls_show", templateVars);
  } else {
    res.send("Your URLS don't match");
  }
  
});

//Post: randomShortURL checked !!!!
app.post("/urls", (req, res) => {
  console.log("/urls");
  if (req.cookies.userId) {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {
      longURL: longURL,
      userId: req.cookies.userId,
    };
    res.redirect("/urls");
    // res.redirect(`/urls/${shortURL}`);
  } else {
    res.send("Sorry, you can't do that right now");
  }
});

//GET: redirectLongURL checked
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

//Post: delete checked
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies.userId;
  const userUrls = urlsForUser(userId, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.send("You don't have permission to do this");
  }
});


// Post: urls/id edit?
app.post("/urls/:id/edit", (req, res) => {
  const userId = req.cookies.userId;
  const userUrls = urlsForUser(userId, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to edit this short URL.");
  }
});

//redirect
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});



//Post: login
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
  
  res.cookie("userId", foundUser.id);
  console.log(foundUser.id);
  res.redirect('/urls');
});

//GET: login.ejs
app.get("/login", (req, res) => {
  if (cookieUserMatch(req.cookies.userId, users)) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      userId: users[req.cookies.userId],
    };
    res.render("urls_login", templateVars);
  }
});


//Post: logout
app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  res.redirect('/urls');
});


//GET: registration.ejs
app.get("/register", (req, res) => {
  if (userIsLoggedIn(req.cookies.userId, users)) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      userId: users[req.cookies.userId],
    };
    res.render("urls_registration", templateVars);
  }
});

//Post: register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Oops, credentials are incorrect1");
  } else if (emailUserMatch(email, users)) {
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

    console.log(users);
    res.cookie("userId", users[userId].id);
    console.log(users[userId]);
    return res.redirect("/urls");
  }
});




//Listener
app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}!`);
});