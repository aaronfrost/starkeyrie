var express = require('express')
//    app = require('express')()
    , app = express()
    , server = require('http').createServer(app)
    , io = require('socket.io').listen(server)
    , twilio = require('twilio')
    , client = twilio('ACa06ffb2f2430fc1cb9aa8ac3d3dae024', 'aff462978a1253b808732cc2826584c9');

server.listen(process.env.PORT || 5001);

app.use("/", express.static(__dirname + '/app'));


app.use(express.bodyParser());

var _socket;


function parseSms(msg){
    var parts = msg.split(/\W(.+)?/);

    return {
        id: parts[0] || "UNKNOWN",
        msg: parts[1] || ""
    }
}


app.post("/sms/hello/:name", function(request, response){

    var name = request.params.name;

    client.sendSms({
        to:'+18013807870',
        from:'+18016236842',
        body: 'Hello, my name is ' + name
    }, function(err, responseData){
        console.log('error', err, responseData);
    });

    console.log('sms send...');
    response.send('OK');
});



app.post("/twilio/voice/call/:number", function(request, response){
    var number = req.params.number;

    twilio.makeCall({
        to:'+' + number,
        from:'+18016236842',
        url: 'http://http://stark-eyrie-7115.herokuapp.com/twiml/sayhello'
    });
});


app.get("/twilio/sayhello", function(request, response){
    var twiml = new twilio.TwimlResponse();
    twiml.say('Hello there. Are you having fun yet?')
        .pause({length: 2})
        .say('Google Developer Group Utah rocks, thanks for coming', {voice: 'woman'});

    response.writeHead(200, {'Content-Type': 'text/xml'});
    response.end(twiml.toString());
});


app.post("/twilio/sms/reply", function(request, response){
    var twiml = new twilio.TwimlResponse();

    var textBody = request.body.Body;

    var text = parseSms(textBody);

    switch(text.id){
        case 'c1':
        case 'C1':
            twiml.sms("Hello " + text.msg + ", your next challenge is: http://nextchallenge");
            break;
        default:
            twiml.sms("Unknown challenge, are you using the right format?")
    }

    response.writeHead(200, {'Content-Type': 'text/xml'});
    response.end(twiml.toString());
});


/*
app.post("/twilio", function(request, response){
    console.log(request.body);

    if(_socket){
        _socket.emit('twilio', request.body);
    }

    response.send('ok');
});*/


if(process.env.PORT){
    console.log("Falling back to xhr-polling");
    io.configure(function () {
        io.set("transports", ["xhr-polling"]);
        io.set("polling duration", 10);
    });
}


io.sockets.on('connection', function (socket) {
    _socket = socket;

    socket.emit('connection', {});

    socket.on('message', function(msg){
        console.log('message', msg);
        socket.broadcast.emit('msg', msg);
    });

    socket.on('remote value', function(data) {
        socket.broadcast.emit('remote', data);
    });
});