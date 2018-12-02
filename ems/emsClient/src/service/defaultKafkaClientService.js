/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');
const kafka = require('kafka-node');

module.exports = {

    publisher: {},
    consumerPool: {},

    init: function (config) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!config.options) {
                reject('Kafka configuration is not valid');
            }
            try {
                const client = new kafka.KafkaClient(config.connectionOptions);
                if (client) {
                    _self.LOG.info('Kafka client is connected : ');
                    this.createPublisher(client, config).then(producer => {
                        _self.publisher = producer;
                        let consumers = [];
                        config.queues.forEach(queue => {
                            if (queue.type && queue.type === 'consumer') {
                                consumers.push(_self.createConsumer(client, config, queue));
                            }
                        });
                        if (consumers.length > 0) {
                            Promise.all(consumers).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            resolve(true);
                        }
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject('While creating Kafka client');
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    createPublisher: function (client, config) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let producer;
                if (config.publisherType === 0) {
                    producer = new kafka.Producer(client, config.publisherOptions);
                } else if (config.publisherType === 1) {
                    producer = new kafka.HighLevelProducer(client, config.publisherOptions);
                } else {
                    _self.LOG.debug('Invalid publisher type : ' + config.publisherType);
                    reject('Invalid publisher type : ' + config.publisherType);
                }
                if (producer) {
                    producer.on("ready", function () {
                        _self.LOG.debug("Kafka Producer is connected and ready.");
                        resolve(producer);
                    });
                    producer.on("error", function (error) {
                        _self.LOG.error('While creating kafka publisher : ' + error);
                        reject('While creating kafka publisher : ' + error);
                    });
                }

            } catch (error) {
                _self.LOG.error(error);
                reject('while creating consumer for queue : ' + queue.inputQueue);
            }
        });
    },

    createConsumer: function (client, config, queue) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                const topics = [{
                    topic: queue.name
                }];
                queue.consumerOptions = _.merge(queue.consumerOptions || {}, config.consumerOptions);
                queue.options = _.merge(queue.options || {}, config.options);
                let consumer;
                if (config.consumerType === 0) {
                    consumer = new kafka.Consumer(client, topics, queue.consumerOptions);
                } else if (config.consumerType === 1) {
                    consumer = new kafka.HighLevelConsumer(client, topics, queue.consumerOptions);
                } else {
                    _self.LOG.error('Invalid publisher type : ' + config.publisherType);
                    reject('Invalid publisher type : ' + config.publisherType);
                }
                if (consumer) {
                    consumer.on("message", function (response) {
                        _self.onConsume(queue, response);
                    });
                    consumer.on("error", function (message) {
                        _self.LOG.error('Kafka Consumer got discunnected...');
                        console.log(message);
                    });
                    _self.LOG.debug('Registered consumer for queue : ', queue.name);
                    resolve(true);
                } else {
                    reject('While creating consumer for queue : ' + queue.name);
                }
            } catch (error) {
                _self.LOG.error(error);
                reject('While creating consumer for queue : ' + queue.name);
            }
        });
    },

    onConsume: function (queue, response) {
        return new Promise((resolve, reject) => {
            try {
                if (response.key && queue.consumerOptions.keyEncoding && queue.consumerOptions.keyEncoding === 'buffer') {
                    let buf = new Buffer(response.key, "binary");
                    response.key = buf.toString();
                }
                if (response.value && queue.consumerOptions.encoding && queue.consumerOptions.encoding === 'buffer') {
                    let buf = new Buffer(response.value, "binary");
                    response.value = buf.toString();
                }
                console.log(response.value);
                let message = JSON.parse(response.value);
                let event = {
                    enterpriseCode: message.enterpriseCode || 'default',
                    tenant: message.tenant || 'default',
                    event: queue.name,
                    source: queue.options.source,
                    target: queue.options.target,
                    nodeId: queue.options.nodeId,
                    state: "NEW",
                    type: "ASYNC",
                    params: [{
                        key: 'key',
                        value: response.key
                    }, {
                        key: 'message',
                        value: message
                    }]
                };
                this.LOG.debug('Pushing event recieved message from  : ', queue.name);
                SERVICE.DefaultEventService.publish(event).then(success => {
                    this.LOG.debug('Message published successfully');
                    resolve(true);
                }).catch(error => {
                    this.LOG.error('Message publishing failed: ', error);
                    reject(error);
                });
            } catch (error) {
                this.LOG.error('Could not parse message recieved from queue : ', queue.name, ' : ERROR is ', error);
                reject(error);
            }
        });
    },

    /**
     * This function is used to publish a message to target Kafka queue. 
     * @param {*} payload   
     * {
     *      "queue": "testPublisherQueue",
     *       "type": "json",
     *       "message": {
     *           "enterpriseCode": "default",
     *           "tenant":"default",
     *           "message":"First API Message by Himkar"
     *       }
     * }
     */
    publish: function (payload) {
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(this.publisher)) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00000',
                    msg: 'Could not found a valid publisher instance'
                });
            } else {
                try {
                    let message = [{
                        topic: payload.queue,
                        messages: payload.message || payload.messages,
                        partition: payload.partition || 0
                    }];
                    this.publisher.send(message, function (err, data) {
                        if (err) {
                            reject({
                                success: false,
                                code: 'ERR_EMS_00000',
                                msg: err
                            });
                        } else {
                            resolve({
                                success: true,
                                code: 'SUC_EMS_00000',
                                msg: 'Message published to queue: ' + payload.queue
                            });
                        }
                    });
                } catch (error) {
                    this.LOG.error(error);
                    reject({
                        success: false,
                        code: 'ERR_EMS_00000',
                        msg: 'Either queue name : ' + payload.queue + ' is not valid or could not created publisher'
                    });
                }
            }
        });
    }
};