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

    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    configureClient: function (config) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!config.connectionOptions) {
                reject('Kafka configuration is not valid');
            }
            try {
                const connection = new kafka.KafkaClient(config.connectionOptions);
                if (connection) {
                    connection.loadMetadataForTopics([], function (error, results) {
                        if (error) {
                            reject(error);
                        } else {
                            let queues = _.get(results, '1.metadata');
                            resolve({
                                connection: connection,
                                queues: queues
                            });
                        }
                    });
                } else {
                    reject('Got null connection while connecting with kafka');
                }
            } catch (error) {
                reject(error);
            }
        });
    },
    configurePublisher: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let clientConfig = options.client.config;
                let producer;
                if (clientConfig.publisherType === 0) {
                    producer = new kafka.Producer(options.client.connection, options.publisher.publisherOptions);
                } else if (clientConfig.publisherType === 1) {
                    producer = new kafka.HighLevelProducer(options.client.connection, options.publisher.publisherOptions);
                } else {
                    _self.LOG.debug('Invalid publisher type : ' + clientConfig.publisherType);
                    reject('Invalid publisher type : ' + clientConfig.publisherType);
                }
                if (producer) {
                    producer.on("ready", function () {
                        _self.LOG.debug("Kafka Producer is connected and ready.");
                        resolve(producer);
                    });
                    producer.on("error", function (error) {
                        _self.LOG.error('While creating kafka publisher : ', error);
                        reject('While creating kafka publisher : ', error);
                    });
                } else {
                    _self.LOG.error('Not able to create kafka publisher');
                    reject('Not able to create kafka publisher');
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    checkQueue: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let queueName = options.consumerName;
                if (options.client.queues && options.client.queues.length > 0 && options.client.queues.includes(queueName)) {
                    resolve(true);
                } else {
                    options.client.connection.createTopics([queueName], (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(true);
                        }
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    registerConsumer: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                _self.checkQueue(options).then(success => {
                    let clientConfig = options.client.config;
                    let queueName = options.consumerName;
                    const topics = [{
                        topic: queueName
                    }];
                    let consumer;
                    if (clientConfig.consumerType === 0) {
                        consumer = new kafka.Consumer(options.client.connection, topics, options.consumer.consumerOptions);
                    } else if (config.consumerType === 1) {
                        consumer = new kafka.HighLevelConsumer(options.client.connection, topics, options.consumer.consumerOptions);
                    } else {
                        _self.LOG.error('Invalid consumer type : ' + clientConfig.consumerType);
                        reject('Invalid consumer type : ' + clientConfig.consumerType);
                    }
                    if (consumer) {
                        options.consumer.name = queueName;
                        consumer.on("message", function (response) {
                            _self.onConsume(options.consumer, response, (error, success) => {
                                if (error) {
                                    _self.LOG.info(response);
                                    _self.LOG.error('Failed to consume message : ' + options.consumer.name + ' : ERROR is ', error);
                                    response.errorType = 'FAILED_CONSUMED';
                                    response.error = error;
                                    _self.handleConsumerError({
                                        consumer: consumer,
                                        queue: options.consumer,
                                        options: options.consumer.consumerOptions,
                                        message: response
                                    });
                                } else {
                                    if (!options.consumer.consumerOptions.autoCommit) {
                                        consumer.commit(function (error, data) {
                                            if (error) {
                                                _self.LOG.error('Failed to commit message : ' + options.consumer.name + ' : ERROR is ', error);
                                                response.errorType = 'FAILED_COMMIT';
                                                response.error = error;
                                                _self.handleConsumerError({
                                                    consumer: consumer,
                                                    queue: options.consumer,
                                                    options: options.consumer.consumerOptions,
                                                    message: response
                                                });
                                            } else {
                                                _self.LOG.debug('Message Successfully consumed and commited: ' + options.consumer.name);
                                            }
                                        });
                                    } else {
                                        _self.LOG.debug('Message Successfully consumed and commited: ' + options.consumer.name);
                                    }
                                }
                            });
                        });
                        consumer.on("error", function (message) {
                            _self.LOG.error(message);
                        });
                        resolve(consumer);
                    } else {
                        reject('While creating consumer for queue : ' + queueName);
                    }
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    handleConsumerError: function (options) {
        let _self = this;
        try {
            if (CONFIG.get('emsClient').logFailedMessages) {
                let tenant = options.queue.options.header.tenant || 'default';
                options.message.active = true;
                SERVICE.DefaultEmsFailedMessagesService.save({
                    tenant: tenant,
                    model: options.message
                }).then(success => {
                    _self.LOG.debug('Message Successfully logged: ' + options.consumer.name);
                }).catch(error => {
                    _self.LOG.error('Failed to log message : ' + options.consumer.name + ' : ERROR is ', error);
                });
            }
        } catch (error) {
            _self.LOG.error('Failed to log message : ' + options.consumer.name + ' : ERROR is ', error);
        }
    },
    onConsume: function (queue, response, callback) {
        try {
            if (response.key && queue.consumerOptions.keyEncoding && queue.consumerOptions.keyEncoding === 'buffer') {
                let buf = new Buffer(response.key, "binary");
                response.key = buf.toString();
            }
            if (response.value && queue.consumerOptions.encoding && queue.consumerOptions.encoding === 'buffer') {
                let buf = new Buffer(response.value, "binary");
                response.value = buf.toString();
            }
            SERVICE.DefaultPipelineService.start('processConsumedMessagePipeline', {
                queue: queue,
                message: response.value
            }, {}).then(success => {
                if (callback) {
                    callback(null, success);
                } else {
                    Promise.resolve(success);
                }

            }).catch(error => {
                if (callback) {
                    callback(error);
                } else {
                    Promise.reject(error);
                }
            });
        } catch (error) {
            if (callback) {
                callback(error);
            } else {
                Promise.reject(error);
            }
        }
    },

    /**
     * This function is used to publish a message to target Kafka queue. 
     * @param {*} payload   
     * {
     *      "queue": "testPublisherQueue",
     *       "message": {
     *           "tenant":"default",
     *           "message":"First API Message by Himkar"
     *       }
     * }
     */
    publish: function (payload) {
        return new Promise((resolve, reject) => {
            try {
                let client = SERVICE.DefaultEmsClientConfigurationService.getPublisher(payload.queue);
                if (client) {
                    client.connection.send([{
                        topic: payload.queue,
                        messages: payload.message || payload.messages,
                        partition: payload.partition || 0
                    }], function (err, data) {
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
                } else {
                    reject({
                        success: false,
                        code: 'ERR_EMS_00000',
                        msg: 'Either queue name : ' + payload.queue + ' is not valid or could not created publisher'
                    });
                }
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00000',
                    msg: 'Either queue name : ' + payload.queue + ' is not valid or could not created publisher'
                });
            }
        });
    }
};