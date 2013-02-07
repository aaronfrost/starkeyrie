console.log("TWILIO_SID: " + process.env.TWILIO_SID);
console.log("TWILIO_AUTH_TOKEN: " + process.env.TWILIO_AUTH_TOKEN.substring(0,2) + "*****");

var  fs = require('fs'),
    express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , twilio = require('twilio');

server.listen(process.env.PORT || 5001);

app.use("/", express.static(__dirname + '/app'));

app.use(express.bodyParser());


//routes
fs.readdirSync(__dirname + '/routes').forEach(function(file) {
    require('./routes/' + file)(app, server, twilio);
});

