const route = require('express').Router();
const User = require('../db/models').User;
const passport = require('../auth/passport');
const eli = require('../auth/utils').eli;
const encryptAes = require('../auth/utils').encryptAes;
const decryptAes = require('../auth/utils').decryptAes;
const AuthToken = require('../db/models').AuthToken;
const OTP = require('../db/models').OTP;
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
  OTP.create({
    aadhaar: req.body.aadhaar,
    otp: "080808"
  }).then((otp) => {
    utilSMS.sendSMS("+919953442721",
      ("aadhaar number is " + req.body.aadhaar + " and your otp is " + otp.otp),
      function (error, result) {
        if (error) {
          winston.log(error);
          res.send(error);
        } else {
          res.redirect('/login.html');
        }
      }
    );
  });

  // let x = new driver.Ed25519Keypair();
  // var pathName = req.body.aadhaar + '-' + Date.now() + path.extname(req.files.scan.name);
  // fs.writeFileSync(path.resolve('uploads') + '/' + pathName, req.files.scan.data, function(err){
  //   return winston.log(err);
  // });
  //
  // let tx = driver.Transaction.makeCreateTransaction(
  //   { medic: 'Initial entry', imgUrl:pathName, datetime: new Date().toString() },
  //   { what: 'My first BigchainDB transaction' },
  //   [ driver.Transaction.makeOutput(
  //     driver.Transaction.makeEd25519Condition(x.publicKey))
  //   ],
  //   x.publicKey
  // );
  //
  // let txSigned = driver.Transaction.signTransaction(tx, x.privateKey);
  // conn.postTransaction(txSigned);
  // User.create({
  //   aadhaar: req.body.aadhaar,
  //   password: encrypt(req.body.password),
  //   publicKey: encryptAes(x.publicKey),
  //   privateKey: encryptAes(x.privateKey),
  //   latest:txSigned.id
  // }).then((user) => {
  //
  // })
});

route.get('/test', (req, res) => {
  var x = "sf65ds4g6sf4fs54g6fs4bfs4b6dsf65g4dfs64g66dfb46dfs";
  var code = encryptAes(x);
  winston.log(code);
  var text = decryptAes(code);
  winston.log(text);
  res.send("success");
});

route.get('/access', eli('/login.html'), (req, res) => {
  res.send(decryptAes(req.user.privateKey));
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
  conn.listOutputs(decryptAes(req.user.publicKey), false).then(outputs => {
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
    return winston.log(err);
  });
  let tx = driver.Transaction.makeCreateTransaction(
    { medic: req.body.mednote, imgUrl:pathName, datetime: new Date().toString() },
    { what: 'New transaction' },
    [ driver.Transaction.makeOutput(
      driver.Transaction.makeEd25519Condition(decryptAes(req.user.publicKey)))
    ],
    decryptAes(req.user.publicKey)
  );

  let txSigned = driver.Transaction.signTransaction(tx, decryptAes(req.user.privateKey));
  conn.postTransaction(txSigned).then(() => {
    res.redirect("/profile.html");
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