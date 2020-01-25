const generateRandomString = function() {
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    let randomAscii = Math.floor((Math.random() * 25) + 97);
    randomString += String.fromCharCode(randomAscii);
  }
  return randomString;
};
const findUserByEmail = (email, usersDatabase) => {
  for (const user of Object.values(usersDatabase)) {
    if (user.email === email) {
      return user;
    }
  }
};
const urlForUser = function(id, urls) {
  const userLongURLs = {};
  for (let [key, value] of Object.entries(urls)) {
    if (value["user"] === id) {
      userLongURLs[key] = value;
    }
  }
  return userLongURLs;
};

module.exports = {
  generateRandomString,
  findUserByEmail,
  urlForUser
};