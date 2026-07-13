/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
const { Kafka, logLevel } = require('kafkajs');

function toBrokerList(connectionOptions) {
    if (connectionOptions.brokers instanceof Array && connectionOptions.brokers.length > 0) {
        return connectionOptions.brokers;
    }
    if (connectionOptions.kafkaHost) {
        return connectionOptions.kafkaHost.split(',').map(item => item.trim()).filter(item => item);
    }
    return [];
}

function toRetryOptions(connectionOptions) {
    let retryOptions = connectionOptions.connectRetryOptions || connectionOptions.retry || {};
    return {
        retries: retryOptions.retries,
        factor: retryOptions.factor,
        multiplier: retryOptions.multiplier,
        initialRetryTime: retryOptions.initialRetryTime || retryOptions.minTimeout,
        maxRetryTime: retryOptions.maxRetryTime || retryOptions.maxTimeout
    };
}

function toMessageList(payload) {
    let messages = payload.messages || payload.message;
    if (!(messages instanceof Array)) {
        messages = [messages];
    }
    return messages.map(message => {
        if (message && typeof message === 'object' && Object.prototype.hasOwnProperty.call(message, 'value')) {
            return {
                key: message.key,
                value: typeof message.value === 'object' ? JSON.stringify(message.value) : String(message.value)
            };
        }
        if (message && typeof message === 'object') {
            return {
                value: JSON.stringify(message)
            };
        }
        return {
            value: String(message)
        };
    });
}

/**
 * @module gFramework/nEms/kafka/src/service/kafka/defaultKafkaClientService
 * @description Implements nEms default kafka client service business behavior and extension logic.
 * @layer service
 * @owner nEms
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
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

    /**

     * Executes configure client behavior.

     *

     * @param {*} config Method input.

     * @returns {*} Method result.

     */

    configureClient: function (config) {
        return new Promise(async (resolve, reject) => {
            if (!config.connectionOptions) {
                reject(new CLASSES.NodicsError('ERR_EMS_00003'));
                return;
            }
            try {
                let brokers = toBrokerList(config.connectionOptions);
                if (brokers.length === 0) {
                    reject(new CLASSES.NodicsError('ERR_EMS_00003', 'Kafka brokers are not configured'));
                    return;
                }
                let kafka = new Kafka({
                    clientId: config.connectionOptions.clientId || CONFIG.get('applicationName') || 'nodics',
                    brokers: brokers,
                    connectionTimeout: config.connectionOptions.connectTimeout,
                    requestTimeout: config.connectionOptions.requestTimeout,
                    retry: toRetryOptions(config.connectionOptions),
                    logLevel: logLevel.NOTHING
                });
                let admin = kafka.admin();
                await admin.connect();
                let topics = await admin.listTopics();
                let queues = {};
                topics.forEach(topic => {
                    queues[topic] = {
                        existing: true
                    };
                });
                resolve({
                    connection: kafka,
                    admin: admin,
                    queues: queues
                });
            } catch (error) {
                reject(new CLASSES.CacheError({
                    code: 'ERR_EMS_00002',
                    message: 'Kafka server is not reachable',
                    metadata: {
                        originalCode: error.code,
                        originalMessage: error.message
                    }
                }, null, 'ERR_EMS_00002'));
            }
        });
    },

    /**

     * Updates producer information.

     *

     * @param {*} client Method input.

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    createProducer: function (client, options) {
        let _self = this;
        return new Promise(async (resolve, reject) => {
            try {
                let producer = client.connection.producer(options || {});
                await producer.connect();
                _self.LOG.debug('Kafka Producer is connected and ready.');
                resolve(producer);
            } catch (error) {
                _self.LOG.error('While creating kafka publisher : ', error);
                reject(new CLASSES.NodicsError(error, 'While creating kafka publisher', 'ERR_EMS_00003'));
            }
        });
    },

    /**

     * Executes configure publisher behavior.

     *

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

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

    /**

     * Processes  behavior.

     *

     * @param {*} payload Method input.

     * @returns {*} Method result.

     */

    publish: function (payload) {
        return new Promise(async (resolve, reject) => {
            try {
                let publisher = SERVICE.DefaultEmsClientConfigurationService.getPublisher(payload.queue);
                await publisher.publisher.send({
                    topic: payload.queue,
                    messages: toMessageList(payload),
                    acks: payload.acks
                });
                resolve({
                    code: 'SUC_EMS_00000',
                    message: 'Message published to queue: ' + payload.queue
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'Either queue name : ' + payload.queue + ' is not valid or could not created publisher', 'ERR_EMS_00000'));
            }
        });
    },

    /**

     * Updates consumer information.

     *

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    registerConsumer: function (options) {
        let _self = this;
        return new Promise(async (resolve, reject) => {
            try {
                await _self.checkQueue(options);
                let queueName = options.consumerName;
                let consumerConfig = options.consumer.consumerOptions || {};
                let consumer = options.client.connection.consumer({
                    groupId: consumerConfig.groupId || queueName + '-group'
                });
                await consumer.connect();
                await consumer.subscribe({
                    topic: queueName,
                    fromBeginning: consumerConfig.fromBeginning || false
                });
                options.consumer.name = queueName;
                await consumer.run({
                    eachMessage: async ({ message }) => {
                        let response = {
                            key: message.key && message.key.toString(),
                            value: message.value && message.value.toString()
                        };
                        _self.onConsume(options.consumer, response, (error, success) => {
                            if (error) {
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
                                _self.LOG.debug('Message Successfully consumed and commited: ' + options.consumer.name);
                            }
                        });
                    }
                });
                resolve(consumer);
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
            }
        });
    },

    /**

     * Validates queue rules.

     *

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    checkQueue: function (options) {
        return new Promise(async (resolve, reject) => {
            try {
                let queueName = options.consumerName;
                if (options.client.queues && options.client.queues[queueName]) {
                    resolve(true);
                    return;
                }
                await options.client.admin.createTopics({
                    topics: [{
                        topic: queueName,
                        numPartitions: 1,
                        replicationFactor: 1
                    }],
                    waitForLeaders: true
                });
                options.client.queues[queueName] = {
                    created: true
                };
                resolve(true);
            } catch (error) {
                if (error.type === 'TOPIC_ALREADY_EXISTS') {
                    options.client.queues[options.consumerName] = {
                        existing: true
                    };
                    resolve(true);
                } else {
                    reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
                }
            }
        });
    },

    /**

     * Processes consumer error behavior.

     *

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    handleConsumerError: function (options) {
        let _self = this;
        try {
            if (CONFIG.get('emsClient').logFailedMessages) {
                let queueOptions = options.queue.options || {};
                let header = queueOptions.header || {};
                let tenant = options.message.tenant || header.tenant;
                if (!tenant && (queueOptions.systemQueue || queueOptions.defaultTenantFallback)) {
                    tenant = CONFIG.get('defaultTenant') || 'default';
                }
                if (!tenant) {
                    _self.LOG.error('Failed to log message : ' + options.consumer.name + ' : tenant is missing');
                    return;
                }
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

    /**

     * Executes on consume behavior.

     *

     * @param {*} queue Method input.

     * @param {*} response Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    onConsume: function (queue, response, callback) {
        try {
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

    /**

     * Executes close consumer behavior.

     *

     * @param {*} consumerName Method input.

     * @param {*} consumer Method input.

     * @returns {*} Method result.

     */

    closeConsumer: function (consumerName, consumer) {
        return new Promise(async (resolve, reject) => {
            try {
                await consumer.consumer.disconnect();
                resolve('Consumer: ' + consumerName + ' closed successfully');
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
            }
        });
    }
};
