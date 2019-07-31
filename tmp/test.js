var stompit = require('stompit');

var connectOptions = {
    'host': 'localhost',
    'port': 61613,
    'connectHeaders': {
        'host': '/',
        'login': 'username',
        'passcode': 'password',
        'heart-beat': '5000,5000'
    }
};

stompit.connect(connectOptions, function (error, client) {

    if (error) {
        console.log('connect error ' + error.message);
        return;
    }

    // var sendHeaders = {
    //     'destination': '/queue/test',
    //     'content-type': 'text/plain'
    // };

    // var frame = client.send(sendHeaders);
    // frame.write('hello');
    // frame.end();

    var subscribeHeaders = {
        'destination': '/queue/test',
        'ack': 'client-individual'
    };

    client.subscribe(subscribeHeaders, function (error, message) {

        if (error) {
            console.log('subscribe error ' + error.message);
            return;
        }

        message.readString('utf-8', function (error, body) {

            if (error) {
                console.log('read message error ' + error.message);
                return;
            }

            console.log('received message: ' + body);

            client.ack(message);

            client.disconnect();
        });
    });
});