const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());
app.set("view engine", "ejs");

// Functions and Storage
const generateRandomString = function () {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const user = {
  1: {
    id: 1,
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  2: {
    id: 2,
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  3: {
    id: 2,
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// ******************************* */

//x
app.get("/", (req, res) => {
  res.send("Hello!");
});

//x
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//x
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Renders: INDEX.ejs
app.get("/urls", (request, response) => {
  const templateVars = { urls: urlDatabase};
  response.render("urls_index", templateVars);
});

//Renders: NEW.ejs
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Renders: SHOW.ejs
app.get("/urls/:id", (request, response) => {
  const templateVars = {id: request.params.id, longURL: "http://www.lighthouselabs".ca};
  response.render("urls_show", templateVars);
});

// Cookie Parser Example
// Pass in the username to the urls_index and render it
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };

  console.log(templateVars);
  console.log('templateVars');
  res.render("urls_index", templateVars);
});



// ************  MINE  ******************* */

//Makes Key(shortURL) : Value(longURL) & adds to urlDatabase
app.post("/urls", (request, response) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = request.body.longURL;
  console.log(shortURL), console.log(urlDatabase);
  response.redirect(`/urls`);
  
});

//Redirects from /u/:id to actual site.
app.get("/u/:id", (req, res) => {
  // console.log(urlDatabase[req.params.id]);
  const longURL = urlDatabase[req.params.id];
  console.log(longURL);
  res.redirect(`${longURL}`);
});

//Delete
app.post("/urls/:id/delete", (request, res) => {
  const shortURL = request.params.id;
  const longURL = urlDatabase[shortURL];
  
  delete urlDatabase[request.params.id];
 
  console.log(`Deleted: ${shortURL}: ${longURL}`);
  console.log(urlDatabase);
  
  res.redirect("/urls");
});

//what I want: when I click on edit in index, it takes me to urls/:specific id
//Edit
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  
  urlDatabase[shortURL] = longURL;
  console.log(`Editing: ${shortURL} : ${longURL}`);
  console.log(urlDatabase);
  res.redirect(`/urls/`);
});

// Edit-Index-Redirect
//Redirects from index-edit button to specific id/show page.
app.post("/urls/:id/redit", (req, res) => {
  const shortURL = req.params.id;
  console.log('redirecting...');
  res.redirect(`/urls/${shortURL}`);
});

//>>> Login Route
//Sets cookie name and value.
app.post("/login", (req, res) => {
  console.log(req.body); //vanillaice
  // console.log(req.body); //{ username: 'vanillaice' }
  // console.log(user);
  res.cookie('userId', req.body.username);
  res.redirect("/urls");
});








// // ************  /MINE  ******************* */




//Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});






// const urlDatabase = {
//     "b2xVn2": "http://www.lighthouselabs.ca",
//     "9sm5xK": "http://www.google.com"
// };'





// const user1 = {
//   id: 1,
//   name: "Pequeno pollo de la pampa",
//   email: "pock@pock.com",
//   location: "Pampa",
// };

// // /users/2
// const user2 = {
//   id: 2,
//   name: "Bob the Bass",
//   email: "glub@glub.com",
//   location: "A river near you",
// };

// const users = {
//   1: user1,
//   2: user2,
// };

// app.get("/", (req, res) => {
//   return res.send("Request received");
// });

// // Wildcards!
// // Placeholder

// const fetchUserById = (userId) => {
//   if (users[userId]) {
//     return users[userId];
//   }

//   return "This is not a valid user id";
// };

// app.get("/users/:user_id", (req, res) => {
//   // const user_id = req.params.user_id;
//   const { user_id } = req.params;

//   console.log(user_id);

//   const currentUser = fetchUserById(user_id);
//   return res.json(currentUser);
// });