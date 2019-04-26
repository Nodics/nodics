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

    configurePublisher: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                resolve({});
            } catch (error) {
                reject(error);
            }
        });
    },

    registerConsumer: function (options) {
        _self = this;
        return new Promise((resolve, reject) => {
            let queueName = options.consumerName;
            try {
                options.client.connection.subscribe({
                    destination: queueName,
                    ack: options.consumer.options.acknowledgeType
                }, (err, msg) => {
                    if (err) {
                        _self.LOG.error('While subscribing to queue : ' + queueName);
                        _self.LOG.error(err);
                    } else {
                        msg.readString(options.consumer.consumerOptions.encodingType, (err, body) => {
                            if (!options.consumer.consumerOptions.ackRequired) {
                                msg.ack(msg);
                            }
                            if (err) {
                                _self.LOG.error('While consuming message from queue : ' + queueName);
                                _self.LOG.error(err);
                            } else {
                                options.consumer.name = queueName;
                                _self.onConsume(options.consumer, body).then(success => {
                                    if (options.consumer.consumerOptions.ackRequired) {
                                        msg.ack();
                                    }
                                }).catch(error => {
                                    _self.LOG.error('While processing comsumed message: ', body);
                                    _self.LOG.error(error);
                                });
                            }
                        });
                    }
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
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
                    this.LOG.error('Failed to publish message : ', queue.name, ' : ERROR is ', error);
                    reject(error);
                });
            } catch (error) {
                this.LOG.error('Could not parse message recieved from queue : ', queue.name, ' : ERROR is ', error);
                reject(error);
            }
        });
    },

    /**
     * This function is used to publish a message to target ActiveMQ queue. 
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
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let client = SERVICE.DefaultEmsClientConfigurationService.getPublisher(payload.queue);
                if (client) {
                    var frame = client.connection.send({
                        'destination': payload.queue,
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