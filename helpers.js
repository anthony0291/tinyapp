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

module.exports = {
  generateRandomString,
  emailUserMatch,
  urlsForUser,
  userIsLoggedIn,
  cookieUserMatch,
};