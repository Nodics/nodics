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
                reject({
                    success: false,
                    code: 'ERR_EMS_00001'
                });
            } else if (request.payloads instanceof Array && request.payloads.length > 0) {
                let allPayloads = [];
                let failed = [];
                request.payloads.forEach(element => {
                    let publisher = SERVICE.DefaultEmsClientConfigurationService.getPublisher(element.queue);
                    if (publisher && publisher.client && publisher.client.config && publisher.client.config.handler) {
                        allPayloads.push(SERVICE[publisher.client.config.handler].publish(element));
                    } else {
                        failed.push({
                            success: false,
                            code: 'ERR_EMS_00000',
                            msg: 'Invalid queue name: ' + element.queue
                        });
                    }

                });
                if (allPayloads.length > 0) {
                    Promise.all(allPayloads).then(success => {
                        resolve({
                            success: true,
                            code: 'SUC_EMS_00000',
                            result: success,
                            failed: failed
                        });
                    }).catch(error => {
                        reject({
                            success: false,
                            code: 'ERR_EMS_00000',
                            error: error,
                            failed: failed
                        });
                    });
                } else {
                    resolve({
                        success: true,
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
                    reject({
                        success: false,
                        code: 'ERR_EMS_00000',
                        msg: 'Invalid queue name: ' + payloads.queue
                    });
                }
            }
        });
    },

    registerConsumers: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(request.consumers)) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00005',
                    error: 'Consumer object can not be null or empty'
                });
            } else {
                try {
                    let consumers = {};
                    if (request.consumers instanceof Array) {
                        request.consumers.forEach(consumerName => {
                            if (CONFIG.get('emsClient').consumers[consumerName]) {
                                consumers[consumerName] = CONFIG.get('emsClient').consumers[consumerName];
                            } else {
                                throw new Error('Invalid consumer name: ' + consumerName);
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
                            success: true,
                            code: 'SUC_EMS_00000',
                            result: Object.keys(consumers)
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            }
        });
    },

    closeConsumers: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(request.consumers)) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00005',
                    error: 'Consumer object can not be null or empty'
                });
            } else {
                try {
                    SERVICE.DefaultEmsClientConfigurationService.closeConsumers(request.consumers).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            }
        });
    },

    registerPublishers: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(request.publishers)) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00005',
                    error: 'Publisher object can not be null or empty'
                });
            } else {
                try {
                    let publishers = {};
                    if (request.publishers instanceof Array) {
                        request.publishers.forEach(publisherName => {
                            if (CONFIG.get('emsClient').publishers[publisherName]) {
                                publishers[publisherName] = CONFIG.get('emsClient').publishers[publisherName];
                            } else {
                                throw new Error('Invalid publisher name: ' + publisherName);
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
                            success: true,
                            code: 'SUC_EMS_00000',
                            result: Object.keys(publishers)
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            }
        });
    },

    closePublishers: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(request.publishers)) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00005',
                    error: 'publishers array can not be null or empty'
                });
            } else {
                try {
                    SERVICE.DefaultEmsClientConfigurationService.closePublishers(request.publishers).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            }
        });
    }
};