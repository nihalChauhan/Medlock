const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const cors = require('cors');
const passport = require('./auth/passport');
const fileUpload = require('express-fileupload');

const app = express();

const fs = require('fs');
const dotenv = require('dotenv');
var envConfig;
envConfig = dotenv.parse(fs.readFileSync(__dirname + "/.env"));
for (var k in envConfig) {
  process.env[k] = envConfig[k]
}

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser('my super secret'));
app.use(expressSession({
  secret: 'my super secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.use('/', require('./routes/index'));
app.use('/', express.static(__dirname + "/public_static"));
app.use('/images/', express.static(__dirname + "/uploads"));

app.listen(8000, function () {
  console.log("Server started on http://localhost:8000");
});