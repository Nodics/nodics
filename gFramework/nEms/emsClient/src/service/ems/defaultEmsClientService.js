/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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

    publish: function (request) {
        return new Promise((resolve, reject) => {
            let emsConfig = CONFIG.get('emsClient');
            let conf = emsConfig[emsConfig.type];
            if (!request.payloads) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00001'
                });
            } else if (request.payloads instanceof Array && request.payloads.length > 0) {
                let allPayloads = [];
                request.payloads.forEach(element => {
                    allPayloads.push(SERVICE[conf.handler].publish(element));
                });
                if (allPayloads.length > 0) {
                    Promise.all(allPayloads).then(success => {
                        resolve({
                            success: true,
                            code: 'SUC_EMS_00000',
                            result: success
                        });
                    }).catch(error => {
                        reject({
                            success: false,
                            code: 'ERR_EMS_00000',
                            error: error
                        });
                    });
                }
            } else {
                SERVICE[conf.handler].publish(request.payloads).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    registerConsumers: function (request) {
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(_self.emsClients)) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00006',
                    error: 'EMS is not active for this module'
                });
            } else if (UTILS.isBlank(request.consumers)) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00005',
                    error: 'Consumer object can not be null or empty'
                });
            } else {
                try {
                    let comsumerList = Object.keys(request.consumers);
                    SERVICE.DefaultEmsClientConfigurationService.registerConsumer(comsumerList, consumers).then(success => {
                        _.merge(CONFIG.get('emsClient').consumers, request.consumers);
                        resolve({
                            success: true,
                            code: 'SUC_EMS_00000',
                            result: Object.keys(request.consumers)
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

    registerPublishers: function (request) {
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(_self.emsClients)) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00006',
                    error: 'EMS is not active for this module'
                });
            } else if (UTILS.isBlank(request.publishers)) {
                reject({
                    success: false,
                    code: 'ERR_EMS_00005',
                    error: 'Publisher object can not be null or empty'
                });
            } else {
                try {
                    let publisherList = Object.keys(request.publishers);
                    SERVICE.DefaultEmsClientConfigurationService.configurePublisher(publisherList, publishers).then(success => {
                        _.merge(CONFIG.get('emsClient').punlishers, request.publishers);
                        resolve({
                            success: true,
                            code: 'SUC_EMS_00000',
                            result: Object.keys(request.publishers)
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
};