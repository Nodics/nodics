// var stompit = require('stompit');

// var connectOptions = {
//     'host': 'localhost',
//     'port': 61613,
//     'connectHeaders': {
//         'host': '/',
//         'login': 'username',
//         'passcode': 'password',
//         'heart-beat': '5000,5000'
//     }
// };

// stompit.connect(connectOptions, function (error, client) {

//     if (error) {
//         console.log('connect error ' + error.message);
//         return;
//     }

//     // var sendHeaders = {
//     //     'destination': '/queue/test',
//     //     'content-type': 'text/plain'
//     // };

//     // var frame = client.send(sendHeaders);
//     // frame.write('hello');
//     // frame.end();

//     var subscribeHeaders = {
//         'destination': '/queue/test',
//         'ack': 'client-individual'
//     };

//     client.subscribe(subscribeHeaders, function (error, message) {

//         if (error) {
//             console.log('subscribe error ' + error.message);
//             return;
//         }

//         message.readString('utf-8', function (error, body) {

//             if (error) {
//                 console.log('read message error ' + error.message);
//                 return;
//             }

//             console.log('received message: ' + body);

//             client.ack(message);

//             client.disconnect();
//         });
//     });
// });

const kafka = require('kafka-node');
let connection = new kafka.KafkaClient({
    kafkaHost: '10.21.77.64:9092'
});

let consumer = new kafka.Consumer(
    connection,
    [
        { topic: 'kafkaInternalJsonSchemaDataConsumerQueue', partition: 0 }
    ],
    {
        autoCommit: true
    }
);
consumer.on('message', function (message) {
    console.log(message);
});

consumer.on("error", function (message) {
    console.error(message);
});

let consumer1 = new kafka.Consumer(
    connection,
    [
        { topic: 'kafkaInternalXMLSchemaDataConsumerQueue', partition: 0 }
    ],
    {
        autoCommit: true,
        fetchMaxWaitMs: 1000,
        fetchMaxBytes: 1024 * 1024,
        encoding: 'buffer',
        keyEncoding: 'utf8'
    }
);
consumer1.on('message', function (message) {
    console.log(message);
});

consumer1.on("error", function (message) {
    console.error(message);
});