var http = require('http');

module.exports = function(app, server, twilio){
    var client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    var io = require('socket.io').listen(server);


    if(process.env.PORT){
        console.log("Falling back to xhr-polling");
        io.configure(function () {
            io.set("transports", ["xhr-polling"]);
            io.set("polling duration", 10);
        });
    }

    io.sockets.on('connection', function (socket) {
        socket.emit('connection', {});
    });


    function parseSms(msg){
        var parts = msg.split(/\W(.+)?/);

        return {
            id: parts[0] || "UNKNOWN",
            msg: parts[1] || ""
        }
    }


    /*
     // Send an sms message
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


    // Make a phone call
    app.post("/twilio/voice/call/:number", function(request, response){
        var number = request.params.number;

        client.makeCall({
            to:'+' + number,
            from:'+18016236842',
            url: 'http://stark-eyrie-7115.herokuapp.com/twilio/sayhello'
        });

        response.end("ok");
    });
    */

    app.post("/host/voice", function(request, response){
        var twiml = new twilio.TwimlResponse();
        twiml.say('Hello there. Are you having fun yet?')
            .pause({length: 2})
            .say('Google Developer Group Utah rocks, thanks for coming', {voice: 'woman'});

        response.writeHead(200, {'Content-Type': 'text/xml'});
        response.end(twiml.toString());
    });

    app.post("/host/sms", function(request, response){
        

        var twiml = new twilio.TwimlResponse();
        console.log("SMS INCOMING >>>>>>>>>>>",  request.body);

        var textBody = request.body.Body;


        if(textBody.indexOf('wind') > -1 || textBody.indexOf('blows') > -1){
            // WINNER
            io.sockets.emit('c3', request.body);
        }
        else{
            var text = parseSms(textBody);

            switch(text.id.toUpperCase()){
                case 'GDG':
                    twiml.sms("Hi "+ text.msg);
                    io.sockets.emit('c1', request.body);
                    break;
                case 'CALLME':
                    twiml.sms("mp3 http://stark-eyrie-7115.herokuapp.com/cmm.mp3");
                    break;
                case 'TWILIOROCKS':
                    io.sockets.emit('c2', request.body);
                    break;
                case '33':
                    client.makeCall({
                        to:request.body.From,
                        from:'+18016236842',
                        url: 'http://stark-eyrie-7115.herokuapp.com/host/congrats'
                    });
                    break;
                case 'HELLO':
                    twiml.sms("Are you ready to play Survivor, GDG Utah?");
                    io.sockets.emit('c0', request.body);
                    break;
                default:
                    console.log('UNKNOWN -- ');
            }
        }

        response.writeHead(200, {'Content-Type': 'text/xml'});
        response.end(twiml.toString());
    });

    app.post('/host/congrats', function(req, res){
        var twiml = new twilio.TwimlResponse();
        twiml.pause({length: 3});
        twiml.say('Any way the wind blows, doesn\'t really matter two me');

        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
    });
};