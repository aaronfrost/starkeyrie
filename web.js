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

app.get("/sms/reply/c1", function(request, response){
    var twiml = new twilio.TwimlResponse();
    twiml.sms('http://twilio.com');

    response.writeHead(200, {'Content-Type': 'text/xml'});
    response.end(twiml.toString());
});

/*
app.post("/sms/hello/:name", function(request, response){

    var name = req.params.name;

    twilio.makeCall({
        to:'+18013807870',
        from:'+18016236842',
        url: 'https://demo.twilio.com/welcome/voice/'
    });

    console.log('twilio call...');
});
*/
app.post("/twilio", function(request, response){
    console.log(request.body);

    if(_socket){
        _socket.emit('twilio', request.body);
    }

    response.send('ok');
});


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