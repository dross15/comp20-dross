// Twilio Credentials
var accountSid = 'AC9e5fcaae157b68d87fbb254511ebae5d';
var authToken = '3d954e548ffa8f96ee6fe7ebe40edf3c';

//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);

client.messages.create({
    to: "+17143632008",
    from: "+15623035488",
    body: "This is the ship that made the Kessel Run in fourteen parsecs?",
}, function(err, message) {
    console.log(message.sid);
});
