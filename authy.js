const Client = require('authy-client').Client;
const authy = new Client({key: AUTHY_API_KEY});

const enums = require('authy-client').enums;

authy.startPhoneVerification({ countryCode: 'US', locale: 'en', phone: '5551234567', via: enums.verificationVia.SMS }, function(err, res) {
  if (err) throw err;

  console.log('Phone information', response);
});

const Client = require('authy-client').Client;
const authy = new Client({key: AUTHY_API_KEY});

client.verifyPhone({ countryCode: 'US', phone: '5551234567', token: '1234' }, function(err, res) {
  if (err) throw err;

  console.log('Verification code is correct');
});
