/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');
const stompit = require('stompit');

module.exports = {
    client: {},

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
            if (!config.connectionOptions || !config.reconnectOptions) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00003'
                });
            }
            try {
                let connectionManager = new stompit.ConnectFailover(config.connectionOptions, config.reconnectOptions);
                connectionManager.on('error', function (error) {
                    var connectArgs = error.connectArgs;
                    var address = connectArgs.host + ':' + connectArgs.port;
                    _self.LOG.error('Could not connect to ' + address + ' : ' + error.message);
                });

                connectionManager.on('connecting', function (connector) {
                    var address = connector.serverProperties.remoteAddress.transportPath;
                    _self.LOG.debug('Connecting to ' + address);
                });

                connectionManager.connect(function (error, connection, reconnect) {
                    if (error) {
                        _self.LOG.error('Connection failed to ActiveMQ server');
                        _self.LOG.error(error);
                        reject({
                            success: false,
                            code: 'ERR_EMS_00002',
                            msg: 'ActiveMQ server is not reachable...',
                            error: error
                        });
                    } else {
                        connection.on("error", function (error) {
                            _self.LOG.error("ActiveMQ Connection lost. Reconnecting...");
                            _self.LOG.error(error);
                            reconnect();
                        });
                        resolve({
                            connection: connection,
                            connectionManager: connectionManager,
                            queues: []
                        });
                    }
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00000',
                    error: error
                });
            }
        });
    },

    createProducer: function (client, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                resolve(client.connection);
            } catch (error) {
                reject(error);
            }
        });
    },

    configurePublisher: function (options) {
        return new Promise((resolve, reject) => {
            try {
                if (options.client && options.client.producer) {
                    resolve(options.client.producer);
                } else {
                    reject('Invalid client configuration');
                }
            } catch (error) {
                reject(error);
            }
        });
    },


    publish: function (payload) {
        return new Promise((resolve, reject) => {
            try {
                let publisher = SERVICE.DefaultEmsClientConfigurationService.getPublisher(payload.queue);
                let frame = publisher.publisher.send({
                    'destination': '/queue/' + payload.queue,
                    'content-type': 'application/json'
                });
                if (payload.type === 'json') {
                    frame.write(JSON.stringify(payload.message));
                } else {
                    frame.write(payload.message);
                }
                frame.end();
                resolve({
                    success: true,
                    code: 'SUC_EMS_00000',
                    msg: 'Message published to queue: ' + payload.queue
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00000',
                    msg: 'Either queue name : ' + payload.queue + ' is not valid or could not created publisher'
                });
            }
        });
    },

    registerConsumer: function (options) {
        _self = this;
        return new Promise((resolve, reject) => {
            let queueName = options.consumerName;
            try {
                let channel = new stompit.Channel(options.client.connectionManager, {
                    alwaysConnected: true
                });
                channel.subscribe({
                    destination: queueName
                }, (err, msg) => {
                    if (err) {
                        _self.LOG.error('While subscribing to queue : ' + queueName);
                        _self.LOG.error(err);
                    } else {
                        msg.readString('utf-8', function (err, body) {
                            if (err) {
                                _self.LOG.error('While consuming message from queue : ' + queueName);
                                _self.LOG.error(err);
                            } else {
                                options.consumer.name = queueName;
                                _self.onConsume(options.consumer, body).then(success => {
                                    // just acknowledged if require
                                }).catch(error => {
                                    _self.LOG.error('While processing comsumed message: ' + body);
                                    _self.LOG.error(error);
                                    try {
                                        body = JSON.parse(body);
                                    } catch (err) {
                                        body = {
                                            data: body
                                        };
                                    }
                                    body.errorType = 'FAILED_CONSUMED';
                                    body.error = error;
                                    _self.handleConsumerError({
                                        consumer: options.client.connection,
                                        queue: options.consumer,
                                        options: options.consumer.consumerOptions,
                                        message: body
                                    });
                                });
                            }
                        });
                    }
                });
                resolve(channel);
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

    onConsume: function (queue, body) {
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('processConsumedMessagePipeline', {
                    queue: queue,
                    message: body
                }, {}).then(success => {
                    resolve(true);
                }).catch(error => {
                    this.LOG.error('Failed to publish message : ' + queue.name + ' : ERROR is ', error);
                    reject(error);
                });
            } catch (error) {
                this.LOG.error('Could not parse message recieved from queue : ' + queue.name + ' : ERROR is ', error);
                reject(error);
            }
        });
    },

    closeConsumer: function (consumerName, consumer) {
        return new Promise((resolve, reject) => {
            try {
                consumer.consumer.close();
                resolve('Consumer: ' + consumerName + ' closed successfully');
            } catch (error) {
                reject(error);
            }
        });
    }
};