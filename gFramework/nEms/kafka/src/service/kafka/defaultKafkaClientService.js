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
                reject(new CLASSES.NodicsError('ERR_EMS_00003'));
            }
            try {
                const connection = new kafka.KafkaClient(config.connectionOptions);
                if (connection) {
                    connection.loadMetadataForTopics([], function (error, results) {
                        if (error) {
                            reject(new CLASSES.CacheError(error, 'Kafka server is not reachable...', 'ERR_EMS_00002'));
                        } else {
                            let queues = _.get(results, '1.metadata');
                            resolve({
                                connection: connection,
                                queues: queues
                            });
                        }
                    });
                } else {
                    reject(new CLASSES.CacheError('ERR_EMS_00002', 'Kafka server is not reachable...'));
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
            }
        });
    },

    createProducer: function (client, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let clientConfig = client.config;
                let producer;
                if (clientConfig.publisherType === 0) {
                    producer = new kafka.Producer(client.connection, options);
                } else if (clientConfig.publisherType === 1) {
                    producer = new kafka.HighLevelProducer(client.connection, options);
                } else {
                    _self.LOG.debug('Invalid publisher type : ' + clientConfig.publisherType);
                    reject(new CLASSES.NodicsError('ERR_EMS_00004', 'Invalid publisher type : ' + clientConfig.publisherType));
                }
                if (producer) {
                    producer.on("ready", function () {
                        _self.LOG.debug("Kafka Producer is connected and ready.");
                        resolve(producer);
                    });
                    producer.on("error", function (error) {
                        _self.LOG.error('While creating kafka publisher : ', error);
                        reject(new CLASSES.NodicsError(error, 'While creating kafka publisher', 'ERR_EMS_00003'));
                    });
                } else {
                    _self.LOG.error('Not able to create kafka publisher');
                    reject(new CLASSES.NodicsError('ERR_EMS_00004', 'Not able to create kafka publisher'));
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
            }
        });
    },

    configurePublisher: function (options) {
        return new Promise((resolve, reject) => {
            try {
                if (options.client && options.client.producer) {
                    resolve(options.client.producer);
                } else {
                    reject(new CLASSES.NodicsError('ERR_EMS_00004', 'Invalid client configuration'));
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
            }
        });
    },


    publish: function (payload) {
        return new Promise((resolve, reject) => {
            try {
                let publisher = SERVICE.DefaultEmsClientConfigurationService.getPublisher(payload.queue);
                publisher.publisher.send([{
                    topic: payload.queue,
                    messages: payload.message || payload.messages,
                    partition: payload.partition || 0
                }], function (err, data) {
                    if (err) {
                        reject(new CLASSES.NodicsError(err, null, 'ERR_EMS_00000'));
                    } else {
                        resolve({
                            code: 'SUC_EMS_00000',
                            message: 'Message published to queue: ' + payload.queue
                        });
                    }
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'Either queue name : ' + payload.queue + ' is not valid or could not created publisher', 'ERR_EMS_00000'));
            }
        });
    },

    registerConsumer: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                _self.checkQueue(options).then(success => {
                    let queueName = options.consumerName;
                    const topics = [{
                        topic: queueName,
                        partition: options.consumer.partition || 0
                    }];
                    let consumer = new kafka.Consumer(options.client.connection, topics, options.consumer.consumerOptions);
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
                        reject(new CLASSES.NodicsError('ERR_EMS_00004', 'While creating consumer for queue : ' + queueName));
                    }
                    resolve(consumer);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
            }
        });
    },

    checkQueue: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let queueName = options.consumerName;
                if (options.client.queues && options.client.queues[queueName]) {
                    resolve(true);
                } else {
                    options.client.connection.createTopics([queueName], (error, result) => {
                        if (error) {
                            reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
                        } else {
                            options.client.queues[queueName] = {
                                created: true
                            };
                            resolve(true);
                        }
                    });
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
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
                Promise.reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
            }
        }
    },

    closeConsumer: function (consumerName, consumer) {
        return new Promise((resolve, reject) => {
            try {
                if (!consumer.consumer.paused) {
                    consumer.consumer.pause();
                    resolve('Consumer: ' + consumerName + ' closed successfully');
                } else {
                    resolve('Consumer: ' + consumerName + ' is already closed');
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
            }
        });
    }
};