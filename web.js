console.log("TWILIO_SID: " + process.env.TWILIO_SID);
console.log("TWILIO_AUTH_TOKEN: " + process.env.TWILIO_AUTH_TOKEN.substring(0,2) + "*****");

var express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , io = require('socket.io').listen(server)
    , twilio = require('twilio')
    , client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
    , client2 = twilio(process.env.TWILIO_SID2, process.env.TWILIO_AUTH_TOKEN2);

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


app.post("/twilio/sms/send", function(request, response){
    var msg = request.body;
    console.log(msg);

    client.sendSms({
        to: msg.to,
        from: msg.from,
        body: msg.body
    }, function(err, responseData){
        console.log('error', err, responseData);
    });

    response.send('OK');
});



app.post("/twilio/voice/call/:number", function(request, response){
    var number = request.params.number;

    client.makeCall({
        to:'+' + number,
        from:'+18016236842',
        url: 'http://stark-eyrie-7115.herokuapp.com/twilio/sayhello'
    });

    response.end("ok");
});


app.post("/twilio/sayhello", function(request, response){
    var twiml = new twilio.TwimlResponse();
    twiml.say('Hello there. Are you having fun yet?')
        .pause({length: 2})
        .say('Google Developer Group Utah rocks, thanks for coming', {voice: 'woman'});

    response.writeHead(200, {'Content-Type': 'text/xml'});
    response.end(twiml.toString());
});


app.post("/twilio/sms/reply", function(request, response){
    var twiml = new twilio.TwimlResponse();

    console.log(request.body);

    var textBody = request.body.Body;

    var text = parseSms(textBody);

    switch(text.id.toUpperCase()){
        case 'C1':
            twiml.sms("Hi "+ text.msg +", http://nextchallenge");

            io.sockets.emit('c1', request.body);

            break;
        case 'C2':
            twiml.sms("mp3 http://stark-eyrie-7115.herokuapp.com/cmm.mp3");
            io.sockets.emit('c2', request.body);
            break;

        case 'C3':
            twiml.sms("mp3 http://stark-eyrie-7115.herokuapp.com/cmm.mp3");
            io.sockets.emit('c3', request.body);
            break;
        default:
            twiml.sms("Unknown challenge, are you using the right format?")
            io.sockets.emit('c0', request.body);
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







app.get("/client2/start",function(req, res){

    client2.sendSms({
        to: '+18016236842',
        from: '+18017585121',
        body: 'c1 Aaron Frost'
    }, function(err, responseData){
        console.log('error', err, responseData);
    });

    res.end('CLIENT2 OK');

});
app.get("/client2/start2",function(req, res){

    client2.sendSms({
        to: '+18016236842',
        from: '+18017585121',
        body: 'c2 Aaron Frost'
    }, function(err, responseData){
        console.log('error', err, responseData);
    });

    res.end('CLIENT2 OK');

});
var client2Mp3;

app.post('/client2/sms',function(req, res){
    console.log(req.body.Body);
    client2Mp3 = req.body.Body.split(' ')[1];
    res.end('AARONs ERROR');

    client2.makeCall({
        to:'+18014486681',
        from:'+18017585121',
        url: 'http://stark-eyrie-7115.herokuapp.com/client2/sayhello'
    });

    res.end('thank you twilio');
});

app.post('/client2/sayhello', function(req, res){
    var twiml = new twilio.TwimlResponse();
    twiml.say('Hello there. Are you having fun yet?', {voice: 'woman', language: 'en-gb'})
        .pause({length: 2})
        .play(client2Mp3);

    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
});