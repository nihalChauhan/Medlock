
// import crypt lib
var msg91 = require("msg91")(process.env.MSG91_API_KEY,
    process.env.MSG91_SENDER_ID, process.env.MSG91_ROUTE_NO);


// Send message to user
var sendSMS = function(contactNumber, message, callback) {
  console.log('sending sms');
  msg91.send(contactNumber, message, callback);
};

module.exports = {
  sendSMS: sendSMS
};
