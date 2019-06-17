/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

module.exports = {
    emsClients: {},
    emsPublishers: {},
    emsConsumers: {},
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

    configureEMSClients: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let clients = CONFIG.get('emsClient').clients;
            if (clients && !UTILS.isBlank(clients)) {
                _self.configureEMSClient(Object.keys(clients), clients).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                _self.LOG.warn('There is none client configuration provided');
                resolve(true);
            }
        });
    },

    configureEMSClient: function (clientList, clients) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (clientList && clientList.length > 0) {
                let clientName = clientList.shift();
                let clientConfig = clients[clientName];
                if (clientConfig.enabled) {
                    SERVICE[clientConfig.handler].configureClient(clientConfig).then(client => {
                        _self.LOG.debug('Successfully established connection for : ', clientName);
                        _self.emsClients[clientName] = {
                            clientName: clientName,
                            connection: client.connection,
                            config: clientConfig,
                            queues: client.queues
                        };
                        _self.configureEMSClient(clientList, clients).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    _self.LOG.warn('Client : ' + clientName + ' is not enabled');
                    _self.configureEMSClient(clientList, clients).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    },

    configurePublishers: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let publishers = CONFIG.get('emsClient').publishers;
            if (publishers && !UTILS.isBlank(publishers)) {
                _self.configurePublisher(Object.keys(publishers), publishers).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                _self.LOG.warn('There is none client configuration provided');
                resolve(true);
            }
        });
    },

    configurePublisher: function (publisherList, publishers) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (publisherList && publisherList.length > 0) {
                let publisherName = publisherList.shift();
                let publisher = publishers[publisherName];
                if (publisher.enabled && publisher.client && _self.emsClients[publisher.client]) {
                    let client = _self.emsClients[publisher.client];
                    publisher.publisherOptions = _.merge(_.merge({}, client.config.publisherOptions || {}), publisher.publisherOptions || {});
                    publisher.options = _.merge(_.merge({}, client.config.eventOptions || {}), publisher.options || {});
                    SERVICE[client.config.handler].configurePublisher({
                        publisherName: publisherName,
                        publisher: publisher,
                        client: client
                    }).then(success => {
                        _self.LOG.debug('Successfully created publisher for queue : ', publisherName);
                        _self.emsPublishers[publisherName] = {
                            publisher: success,
                            config: publisher,
                            client: client
                        };
                        _self.configurePublisher(publisherList, publishers).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    _self.LOG.warn('Publisher: ' + publisherName + ' is not enabled or has invalid client configuration');
                    _self.configurePublisher(publisherList, publishers).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    },

    registerConsumers: function () {
        let _self = this;
        if (NODICS.getServerState() === 'started' && NODICS.getActiveChannel() !== 'test' &&
            !NODICS.isNTestRunning() && CONFIG.get('event').publishAllActive) {
            let consumers = CONFIG.get('emsClient').consumers;
            if (consumers && !UTILS.isBlank(consumers)) {
                let comsumerList = Object.keys(consumers);
                _self.registerConsumer(comsumerList, consumers).then(success => {
                    //_self.LOG.debug('Consumers has been registered successfully');
                }).catch(error => {
                    //_self.LOG.error('Failed on consumer registration ', error);
                });
            } else {
                _self.LOG.warn('There is none client configuration provided');
            }
        } else {
            _self.LOG.info('Server is not started yet, hence waiting to register consumers');
            setTimeout(() => {
                _self.registerConsumers();
            }, CONFIG.get('processRetrySleepTime') || 2000);
        }
    },

    registerConsumer: function (consumerList, consumers) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (consumerList && consumerList.length > 0) {
                    let consumerName = consumerList.shift();
                    let consumer = consumers[consumerName];
                    if (consumer.enabled && consumer.client && _self.emsClients[consumer.client]) {
                        let client = _self.emsClients[consumer.client];
                        consumer.consumerOptions = _.merge(_.merge({}, client.config.consumerOptions || {}), consumer.consumerOptions || {});
                        consumer.options = _.merge(_.merge({}, client.config.eventOptions || {}), consumer.options || {});
                        SERVICE[client.config.handler].registerConsumer({
                            consumerName: consumerName,
                            consumer: consumer,
                            client: client
                        }).then(success => {
                            _self.LOG.debug('Successfully registered consumer for queue : ', consumerName);
                            _self.emsConsumers[consumerName] = {
                                consumer: success,
                                config: consumer,
                                client: client
                            };
                            _self.registerConsumer(consumerList, consumers).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        _self.LOG.warn('Consumer: ' + consumerName + ' is not enabled or has invalid client configuration');
                        _self.registerConsumer(consumerList, consumers).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    }
};