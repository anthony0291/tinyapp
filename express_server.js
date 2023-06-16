const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const PORT = 8080;

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

// Functions and Storage
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

  anthony: {
    id: 'anthony',
    email: 'anthony@gmail.com',
    password: '123',
  },
};
const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x10000000).toString(16).substring(1);
};
const emailHasUser = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};
const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};
const userLoggedIn = (userId, users) => {
  for (const user in users) {
    if (userId === user) {
      return true;
    }
  } return false;
};

/* *** ROUTES *** */
//JSON
app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

//Render: index.ejs
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userId: users[req.cookies.userId],
  };
  return res.render("urls_index", templateVars);
});

//Render: new.ejs
app.get("/urls/new", (req, res) => {
  if ((userLoggedIn(req.cookies.userId, users)) === false) {
    return res.redirect("/login");
  } else {
    const templateVars = {
      userId: users[req.cookies.userId],
    };
    return res.render("urls_new", templateVars);
  }
});

//Render: show.ejs
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    userId: users[req.cookies.userId],
  };
  return res.render("urls_show", templateVars);
});

//Render: registration.ejs
app.get("/register", (req, res) => {
  if (userLoggedIn(req.cookies.userId, users)) {
    return res.redirect("/urls");
  } else {
    const templateVars = {
      userId: users[req.cookies.userId],
    };
    return res.render("urls_registration", templateVars);
  }
});

//Render: login.ejs
app.get("/login", (req, res) => {
  if (userLoggedIn(req.cookies.userId, users)) {
    return res.redirect("/urls");
  } else {
    const templateVars = {
      userId: users[req.cookies.userId],
    };
    return res.render("urls_login", templateVars);
  }
});


//Post: randomShortURL
app.post("/urls", (req, res) => {
  if ((userLoggedIn(req.cookies.userId, users)) === false) {
    return res.status(400).send("Sorry, you don't have permission to do this.");
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    console.log(shortURL), console.log(urlDatabase);
    return res.redirect(`/urls/${shortURL}`);
  }
});
//Post: redirectLongURL
app.get("/u/:id", (req, res) => {
  console.log(urlDatabase[req.params]);
  if (urlDatabase[req.params.id] === undefined) {
    return res.status(400).send("Sorry, we can't find that page in our records");
  } else {
    const longURL = urlDatabase[req.params.id];
    console.log(longURL);
    return res.redirect(longURL);
  }
});

//Post: delete
app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params.id);
  delete urlDatabase[req.params.id];
  console.log(urlDatabase);
  res.redirect("/urls");
});

//Post: edit
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  console.log(req.body);
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect("/urls");
});

//Post:
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  return res.redirect(`/urls/${shortURL}`);
});

//Post: login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  for (let userId in users) {
    console.log(users[userId]);
    if (users[userId].email === email) {
      if (users[userId].password === password) {
        res.cookie("userId", userId);
        console.log(res.cookie("userId", userId));
        return res.redirect('/urls');
      }
    }
  }
  return res.status(400).send("You have misinputted your email and/or password");
});

//Post: logout
app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  return res.redirect('/login');
});

//Post: register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Oops, credentials are incorrect1");
  } else if (emailHasUser(email, users)) {
    return res.status(400).send("This email already has an account.");
  } else {
    const userId = generateRandomString();
    users[userId] = {
      id: userId,
      email: email,
      password: password,
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