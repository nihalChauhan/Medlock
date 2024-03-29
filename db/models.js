const Sequelize = require('sequelize');
const winston = require('winston');

const db = new Sequelize({
  username: 'bckyc',
  password: 'bckycpass',
  database: 'kycdb',
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

const User = db.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  aadhaar: {
    type: Sequelize.STRING,
    unique: true,
    notNull: true
  },
  password: Sequelize.STRING,
  privateKey: {
    type: Sequelize.STRING,
    unique: true,
    notNull: true
  },
  publicKey: {
    type: Sequelize.STRING,
    unique: true,
    notNull: true
  },
  latest: {
    type: Sequelize.STRING,
    unique: true,
    notNull: true
  }
});

const AuthToken = db.define('authtoken', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: Sequelize.STRING,
    unique: true,
    index: true
  }
});

AuthToken.belongsTo(User);
User.hasMany(AuthToken);

const OTP = db.define('otp', {
  aadhaar: {
    type: Sequelize.STRING,
    unique: true,
    notNull: true
  },
  otp: {
    type: Sequelize.STRING,
    notNull: true
  }
});

db.sync({force: false}).then(() => {
  winston.log('Database is synchronised');
});

module.exports = {
  User, AuthToken, OTP
};

