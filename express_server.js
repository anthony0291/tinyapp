const express = require("express");

const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // Lesson: Template Engine-EJS
app.use(express.urlencoded({ extended: true }));

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
  1: {
    id: 1,
    email: 'yabba',
    password: "dabba"
  },
  2: {
    id: 3,
    email: 'yabba2',
    password: "dabba2"
  },
  3: {
    id: 3,
    email: 'yabba3',
    password: "dabba3"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

///1
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//(173-hello_world.ejs)
app.get("/hello", (req, res) => {
  //    ^^^^^^^^ localhost:8080/hello
  const templateVars = { greeting: "Hello Bob" };
  //        ^^^ set templateVars to obj with greeting key(go to ejs1)
  res.render("hello_world", templateVars);
  //        (hello_world.ejs, passing in templateVars);
});


//3 INDEX.ejs (173)
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

//NEW.ejs
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});



//SHOW.ejs (Lesson/173)
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});


// app.get("/urls", (req, res) => {
//   const templateVars = {
//     users: users[req.cookies('username')]
//     //...any other vars
//   };
//   console.log(templateVars);
//   res.render("urls_index", templateVars);
// });

//Redirects from /u/:id to actual site.
// app.get("/u/:id", (req, res) => {
//   // console.log(urlDatabase[req.params.id]);
//   const longURL = urlDatabase[req.params.id];
//   console.log(longURL);
//   res.redirect(`${longURL}`);
// });

// ************  POST  ******************* */

//Makes Key(shortURL) : Value(longURL) & adds to urlDatabase
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(shortURL), console.log(urlDatabase);
  res.redirect(`/urls`);
});

//Edit
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(`Editing: ${shortURL} : ${longURL}`);
  console.log(urlDatabase);
  res.redirect(`/urls/`);
});

//Delete
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  delete urlDatabase[req.params.id];
  console.log(`Deleted: ${shortURL}: ${longURL}`);
  console.log(urlDatabase);
  res.redirect("/urls");
});


//Login
app.post("/login", (req, res) => {
  // console.log(req.body);
  // console.log(req.body.username);
  const username = req.body.username;
  res.cookie('username', username);
  // users[userId] = username;
  // console.log(users);
  res.redirect("/urls");
});


app.post('/logout'), (req, res) => {
  res.clearcookie('username');
  res.redirect('/urls');
};


//Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//<% include ./partials/_header %>
