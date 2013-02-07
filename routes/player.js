var http = require('http');

module.exports = function (app, server, twilio) {
    var client2 = twilio(process.env.TWILIO_SID2, process.env.TWILIO_AUTH_TOKEN2);
    var client2Mp3;
    var voice = {voice:'woman', language:'en-gb'};

    app.get("/client2/start", function (req, res) {
        client2.sendSms({
            to:'+18016236842',
            from:'+18017585121',
            body:'c1 Aaron Frost'
        }, function (err, responseData) {
            console.log('error', err, responseData);
        });

        res.end('OK');
    });

    app.get("/client2/start2", function (req, res) {
        client2.sendSms({
            to:'+18016236842',
            from:'+18017585121',
            body:'c2 Aaron Frost'
        }, function (err, responseData) {
            console.log('error', err, responseData);
        });

        res.end('OK');

    });

    app.get("/client2/start3", function (req, res) {
        client2.makeCall({
            to:'+18014486681',
            from:'+18017585121',
            url:'http://stark-eyrie-7115.herokuapp.com/client2/askfornum'
        });

        res.end('OK');
    });

    app.post('/client2/sms', function (req, res) {
        console.log(req.body.Body);
        client2Mp3 = req.body.Body.split(' ')[1];
//        res.end('AARONs ERROR');

        client2.makeCall({
            to:'+18014486681',
            from:'+18017585121',
            url:'http://stark-eyrie-7115.herokuapp.com/client2/sayhello'
        });

        res.end('OK');
    });

    app.post('/client2/voice', function (req, res) {

        var twiml = new twilio.TwimlResponse();

        twiml.pause({length:1});
        twiml.say('Hello, say something');
        twiml.record({transcribe:true, transcribeCallback:'http://stark-eyrie-7115.herokuapp.com/client2/transcription'});

        res.writeHead(200, {'Content-Type':'text/xml'});
        res.end(twiml.toString());

    });

    app.post('/client2/transcription', function (req, res) {
        console.log(req.body.TranscriptionText);


        //TODO: SEND TEXT

    });

    app.post('/client2/sayhello', function (req, res) {
        var twiml = new twilio.TwimlResponse();
        twiml.say('Hello there. Are you having fun yet?', voice)
            .pause({length:2})
            .play(client2Mp3);

        res.writeHead(200, {'Content-Type':'text/xml'});
        res.end(twiml.toString());

    });

    app.post('/client2/askfornum', function (req, res) {
        var twiml = new twilio.TwimlResponse();
        twiml.pause({length:2})
            .say('Hello, this is round 3', voice)
            .pause({length:1})
            .gather({
                action:'http://stark-eyrie-7115.herokuapp.com/client2/numCallback',
                numDigits:5
            }, function () {
                this.say("Please enter five numbers", voice);
            });

        res.writeHead(200, {'Content-Type':'text/xml'});
        res.end(twiml.toString());
    });

    app.post('/client2/numCallback', function (req, res) {
        console.log(req.body.Digits);
        var digits = req.body.Digits.split('');

        var total = 0;
        digits.forEach(function (d) {
            total += parseInt(d);
        });

        var twiml = new twilio.TwimlResponse();
        twiml.say('Well Mister Wisenheimer, your total is ' + total, {voice:'woman', language:'en-gb'});

        client2.sendSms({
            to:'+18016236842',
            from:'+18017585121',
            body:'c3 ' + digits
        }, function (err, responseData) {
            console.log('error', err, responseData);
        });

        res.writeHead(200, {'Content-Type':'text/xml'});
        res.end(twiml.toString());
    });

/*
    app.get("/client2/start", function (req, res) {
        client2.makeCall({
            to:'+18014486681',
            from:'+18017585121',
            url:'http://stark-eyrie-7115.herokuapp.com/client2/askfornum'
        });

        res.end('CLIENT2 OK3');
    });
    */
};