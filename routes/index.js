const route = require('express').Router();
const User = require('../db/models').User;
const passport = require('../auth/passport');
const eli = require('../auth/utils').eli;
const AuthToken = require('../db/models').AuthToken;
const uid2 = require('uid2');
const encrypt = require('../auth/utils').encrypt;
const driver = require('bigchaindb-driver');
const fs = require('fs');
const path = require('path');

const utilSMS = require('../utils/utilSMS');

const conn = new driver.Connection('https://test.ipdb.io/api/v1/', {
  app_id: '4f4cf474',
  app_key: '33eb743338ab79e021a633fe21febc46'
});


route.post('/signup', (req, res) => {
  let x = new driver.Ed25519Keypair();
  var pathName = req.body.aadhaar + '-' + Date.now() + path.extname(req.files.scan.name);
  fs.writeFileSync(path.resolve('uploads') + '/' + pathName, req.files.scan.data, function(err){
    return console.log(err);
  });
/*
  let sampleFile = req.files.scan;
  sampleFile.mv('/files123/aad.png', function(err) {
    if (err) return res.status(500).send(err);});
*/
  let tx = driver.Transaction.makeCreateTransaction(
    { medic: 'Initial entry', imgUrl:pathName, datetime: new Date().toString() },
    { what: 'My first BigchainDB transaction' },
    [ driver.Transaction.makeOutput(
      driver.Transaction.makeEd25519Condition(x.publicKey))
    ],
    x.publicKey
  );

  let txSigned = driver.Transaction.signTransaction(tx, x.privateKey);
  conn.postTransaction(txSigned);
  User.create({
    aadhaar: req.body.aadhaar,
    password: encrypt(req.body.password),
    publicKey: x.publicKey,
    privateKey: x.privateKey,
    latest:txSigned.id
  }).then((user) => {
    utilSMS.sendSMS("+919953442721",
      "your otp is 080808",
      function (error, result) {
        if (error) {
          console.log(error);
          res.send(error);
        } else {
          res.redirect('/login.html');
        }
      }
    );
  })
});

route.post('/test', (req, res) => {
  res.send(req.files.scan);
  fs.writeFileSync(path.resolve('uploads') + '/' + req.files.scan.name, req.files.scan.data, function(err){
    return console.log(err);
  });
});

route.post('/login', passport.authenticate('local', {
  successRedirect: '/profile.html',
  failureRedirect: '/login.html'
}));

route.get('/logout', (req, res) => {
  req.user = null;
  req.logout();
  req.session.destroy(function () {
    res.redirect('/login.html')
  })
});

route.get('/profile', eli('/login.html'), (req, res) => {
  conn.listOutputs(req.user.publicKey, false).then(outputs => {
    transactions = [];
    for(each in outputs) {
      transactions.push(
        conn.getTransaction(outputs[each]["transaction_id"]).then(transaction => {
          return transaction["asset"];
        })
      )
    }
    Promise.all(transactions).then(function(data){
      res.send(data)
    });
  });
});

route.post('/add', eli('/login.html'), (req, res) => {
  var pathName = req.user.aadhaar + '-' + Date.now() + path.extname(req.files.scan.name);
  fs.writeFileSync(path.resolve('uploads') + '/' + pathName, req.files.scan.data, function(err){
    return console.log(err);
  });
  let tx = driver.Transaction.makeCreateTransaction(
    { medic: req.body.mednote, imgUrl:pathName, datetime: new Date().toString() },
    { what: 'New transaction' },
    [ driver.Transaction.makeOutput(
      driver.Transaction.makeEd25519Condition(req.user.publicKey))
    ],
    req.user.publicKey
  );

  let txSigned = driver.Transaction.signTransaction(tx, req.user.privateKey);
  conn.postTransaction(txSigned).then(() => {
    res.send(txSigned);
  })
});

route.post('/token', passport.authenticate('local'), (req, res) => {
  AuthToken.create({
    token: uid2(20),
    userId: req.user.id
  }).then((authToken) => {
    return res.send({
      token: authToken.token
    })
  })
});

module.exports = route;
