const bcrypt = require('bcrypt');

function encrypt(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

function decrypt(password, local_password) {
  return bcrypt.compareSync(password, local_password);
}

function ensureLoggedIn(redirPath) {
  return function (req, res, next) {
    if (!req.user) {
      res.redirect(redirPath)
    } else {
      next();
    }
  }
}

module.exports = {
  eli: ensureLoggedIn,
  encrypt,
  decrypt
};