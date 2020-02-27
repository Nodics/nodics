/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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

    publish: function (request) {
        return new Promise((resolve, reject) => {
            if (!request.payloads) {
                reject(new CLASSES.NodicsError('ERR_EMS_00002'));
            } else if (request.payloads instanceof Array && request.payloads.length > 0) {
                let allPayloads = [];
                let failed = [];
                request.payloads.forEach(element => {
                    let publisher = SERVICE.DefaultEmsClientConfigurationService.getPublisher(element.queue);
                    if (publisher && publisher.client && publisher.client.config && publisher.client.config.handler) {
                        allPayloads.push(SERVICE[publisher.client.config.handler].publish(element));
                    } else {
                        failed.push(new CLASSES.NodicsError('ERR_EMS_00000', 'Invalid queue name: ' + element.queue));
                    }
                });
                if (allPayloads.length > 0) {
                    SERVICE.DefaultNodicsPromiseService.all(allPayloads).then(response => {
                        if (failed.length > 0) {
                            if (!response.errors) response.errors = [];
                            response.errors = response.errors.concat(failed);
                        }
                        resolve({
                            code: 'SUC_EMS_00000',
                            result: response.success,
                            failed: response.errors
                        });
                    }).catch(error => {
                        reject(new CLASSES.NodicsError(error, null, 'SUC_EMS_00000'));
                    });
                } else {
                    resolve({
                        code: 'SUC_EMS_00000',
                        failed: failed
                    });
                }
            } else {
                let publisher = SERVICE.DefaultEmsClientConfigurationService.getPublisher(request.payloads.queue);
                if (publisher && publisher.client && publisher.client.config && publisher.client.config.handler) {
                    SERVICE[publisher.client.config.handler].publish(request.payloads).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject(new CLASSES.NodicsError('ERR_EMS_00000', 'Invalid queue name: ' + payloads.queue));
                }
            }
        });
    },

    registerConsumers: function (request) {
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(request.consumers)) {
                reject(new CLASSES.NodicsError('ERR_EMS_00005', 'Consumer object can not be null or empty'));
            } else {
                try {
                    let consumers = {};
                    if (request.consumers instanceof Array) {
                        request.consumers.forEach(consumerName => {
                            if (CONFIG.get('emsClient').consumers[consumerName]) {
                                consumers[consumerName] = CONFIG.get('emsClient').consumers[consumerName];
                            } else {
                                throw new CLASSES.NodicsError('ERR_EMS_00000', 'Invalid consumer name: ' + consumerName);
                            }
                        });
                    } else {
                        consumers = request.consumers;
                    }
                    let comsumerList = Object.keys(consumers);
                    SERVICE.DefaultEmsClientConfigurationService.registerConsumer(comsumerList, consumers).then(success => {
                        if (!(request.consumers instanceof Array)) {
                            _.merge(CONFIG.get('emsClient').consumers, request.consumers);
                        }
                        resolve({
                            code: 'SUC_EMS_00000',
                            result: Object.keys(consumers)
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
                }
            }
        });
    },
    closeConsumers: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(request.consumers)) {
                reject(new CLASSES.NodicsError('ERR_EMS_00005', 'Consumer object can not be null or empty'));
            } else {
                try {
                    SERVICE.DefaultEmsClientConfigurationService.closeConsumers(request.consumers).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
                }
            }
        });
    },

    registerPublishers: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(request.publishers)) {
                reject(new CLASSES.NodicsError('ERR_EMS_00005', 'Publisher object can not be null or empty'));
            } else {
                try {
                    let publishers = {};
                    if (request.publishers instanceof Array) {
                        request.publishers.forEach(publisherName => {
                            if (CONFIG.get('emsClient').publishers[publisherName]) {
                                publishers[publisherName] = CONFIG.get('emsClient').publishers[publisherName];
                            } else {
                                throw new CLASSES.NodicsError('ERR_EMS_00000', 'Invalid publisher name: ' + publisherName);
                            }
                        });
                    } else {
                        publishers = request.publishers;
                    }
                    let publisherList = Object.keys(publishers);
                    SERVICE.DefaultEmsClientConfigurationService.configurePublisher(publisherList, publishers).then(success => {
                        if (!(request.publishers instanceof Array)) {
                            _.merge(CONFIG.get('emsClient').punlishers, request.publishers);
                        }
                        resolve({
                            code: 'SUC_EMS_00000',
                            result: Object.keys(publishers)
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
                }
            }
        });
    },

    closePublishers: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(request.publishers)) {
                reject(new CLASSES.NodicsError('ERR_EMS_00005', 'Publishers object can not be null or empty'));
            } else {
                try {
                    SERVICE.DefaultEmsClientConfigurationService.closePublishers(request.publishers).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(new CLASSES.NodicsError(error, null, 'ERR_EMS_00000'));
                }
            }
        });
    }
};