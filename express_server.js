const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x10000000).toString(16).substring(1);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (request, response) => {
  const templateVars = { urls: urlDatabase};
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (request, response) => {
  const templateVars = {id: request.params.id, longURL: "http://www.lighthouselabs".ca};
  response.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  const shortURL =  generateRandomString();
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL: newURL};
  console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
  
});

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.id];
  console.log(longURL);
  res.redirect(longURL);
});

// app.get("/u/:id", (req, res) => {
//   // const longURL = ...
//   // const user_id = req.params.user_id;
//   const newURL = req.body.longURL;
//   console.log(newURL);
//   res.redirect(longURL);
// });

//database.b2xVN2

app.post("/urls/:id/delete", (request, response) => {
  console.log(`Deleted ${urlDatabase[request.params.id]}`);
  delete urlDatabase[request.params.id];
  console.log(urlDatabase);
  response.redirect("/urls");

});

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