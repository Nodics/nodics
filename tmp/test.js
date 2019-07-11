// var kafka = require('kafka-node');
// var Producer = kafka.Producer;
// var KeyedMessage = kafka.KeyedMessage;
// const client = new kafka.KafkaClient({
//     kafkaHost: 'localhost:9092'
// });
// var producer = new Producer(client);
// var km = new KeyedMessage('key', 'message');
// var payloads = [
//     { topic: 'topic1', messages: 'hi', partition: 0 },
//     { topic: 'topic2', messages: ['hello', 'world', km] }
// ];


// producer.on('ready', function () {
//     producer.send(payloads, function (err, data) {
//         console.log(data);
//     });
// });

// producer.on('error', function (err) {
//     console.log(err);
// });

// console.log(new Date().getTimezoneOffset());

convertExcel = require('excel-as-json').processFile;
convertExcel('tntData.xlsx', null, {
    sheet: 1,
    isColOriented: false,
    omitEmptyFields: true,
    convertTextToNumber: true
}, (error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log(success);
    }
});

// const excelToJson = require('convert-excel-to-json');


// const result = excelToJson({
//     sourceFile: 'tntData.xlsx',
//     header: {
//         rows: 1
//     },
//     columnToKey: {
//         '*': '{{columnHeader}}'
//     }
// });
// let data = [];
// Object.keys(result).forEach(element => {
//     data = data.concat(result[element]);
// });
// console.log(data);