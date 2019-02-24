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

    configureClent: function (config) {
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
                connectionManager.connect(function (error, client, reconnect) {
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
                        _self.client = client;
                        _self.LOG.debug('Connection established to ActiveMQ server');
                        client.on("error", function (error) {
                            _self.LOG.error("ActiveMQ Connection lost. Reconnecting...");
                            _self.LOG.error(error);
                            reconnect();
                        });
                        _self.registerConsumers(client, config);
                        resolve({
                            success: true,
                            code: 'SUC_EMS_00000',
                            message: 'Connected with ActiveMQ server'
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

    registerConsumers: function (client, config, _self) {
        _self = _self || this;
        if (NODICS.getServerState() === 'started' && NODICS.getActiveChannel() !== 'test' &&
            !NODICS.isNTestRunning() && CONFIG.get('event').publishAllActive) {
            config.queues.forEach(queue => {
                if (queue.type && queue.type === 'consumer') {
                    queue.options = _.merge(queue.options || {}, config.options);
                    client.subscribe({
                        destination: queue.name,
                        ack: queue.options.acknowledgeType
                    }, (err, msg) => {
                        if (err) {
                            _self.LOG.error('While subscribing to queue : ' + queue.name);
                            _self.LOG.error(err);
                        } else {
                            msg.readString(queue.options.encodingType, (err, body) => {
                                if (!queue.options.ackRequired) {
                                    client.ack(msg);
                                }
                                if (err) {
                                    _self.LOG.error('While consuming message from queue : ' + queue.name);
                                    _self.LOG.error(err);
                                } else {
                                    _self.onConsume(queue, body).then(success => {
                                        if (queue.options.ackRequired) {
                                            client.ack(msg);
                                        }
                                    }).catch(error => {
                                        _self.LOG.error('While processing comsumed message: ', body);
                                        _self.LOG.error(error);
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            _self.LOG.info('Server is not started yet, hence waiting to register ActiveMQ consumers');
            setTimeout(() => {
                _self.registerConsumers(client, config, _self);
            }, CONFIG.get('processRetrySleepTime') || 2000);
        }
    },

    onConsume: function (queue, body) {
        return new Promise((resolve, reject) => {
            try {
                let message = JSON.parse(body);
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
            if (UTILS.isBlank(_self.client)) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00000',
                    msg: 'Could not found a valid publisher instance'
                });
            } else {
                try {
                    var frame = _self.client.send({
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