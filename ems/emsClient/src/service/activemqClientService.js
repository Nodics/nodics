/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const stompit = require('stompit');

module.exports = {
    client: {},
    init: function(config) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!config.options) {
                reject('ERROR: Kafka configuration is not valid');
            }
            try {
                stompit.connect(config.options, function(error, client) {
                    _self.client = client;
                    if (client) {
                        config.queues.forEach(queue => {
                            client.subscribe({
                                destination: queue.outputQueue,
                                ack: 'client-individual'
                            }, (err, msg) => {
                                msg.readString('UTF-8', (err, body) => {
                                    _self.onConsume(queue, body);
                                    client.ack(msg);
                                });
                            });
                        });
                        resolve(true);
                    } else {
                        reject('   ERROR: ActiveMQ server is not reachable...');
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    onConsume: function(queue, body) {
        try {
            let message = JSON.parse(body);
            let event = {
                enterpriseCode: message.enterpriseCode || 'default',
                event: queue.outputQueue,
                source: 'activemqMessageConsumed',
                target: queue.targetModule,
                state: "NEW",
                type: "ASYNC",
                params: [{
                    key: 'message',
                    value: JSON.stringify(message)
                }]
            };
            console.log('   INFO: Pushing event for recieved message from  : ', queue.inputQueue);
            SERVICE.EventService.publish(event);
        } catch (error) {
            console.log('   ERROR: Could not parse message recieved from queue : ', queue.inputQueue, ' : ERROR: ', error);
        }
    },

    publish: function(payload) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(_self.client)) {
                reject('   ERROR: Could not found a valid publisher instance');
            } else {
                try {
                    var frame = _self.client.send({
                        'destination': payload.queue,
                        'content-type': 'application/json'
                    });
                    frame.write(payload.message);
                    frame.end();
                    resolve(true);
                } catch (error) {
                    console.log(error);
                    reject('   ERROR: Either queue name : ' + payload.queue + ' is not valid or could not created publisher');
                }
            }
        });
    }
};