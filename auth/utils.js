const bcrypt = require('bcrypt');
const aesjs = require('aes-js');

function encrypt(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

function decrypt(password, local_password) {
  return bcrypt.compareSync(password, local_password);
}

function encryptAes(text) {
  var key = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
    29, 30, 31];
  var textBytes = aesjs.utils.utf8.toBytes(text);
  var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  var encryptedBytes = aesCtr.encrypt(textBytes);

  return aesjs.utils.hex.fromBytes(encryptedBytes);
}

function decryptAes(code) {
  var key = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
    29, 30, 31];
  var encryptedBytes = aesjs.utils.hex.toBytes(code);

// The counter mode of operation maintains internal state, so to
// decrypt a new instance must be instantiated.
  var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  var decryptedBytes = aesCtr.decrypt(encryptedBytes);

// Convert our bytes back into text
  var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  return decryptedText;
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
  decrypt,
  encryptAes,
  decryptAes
};