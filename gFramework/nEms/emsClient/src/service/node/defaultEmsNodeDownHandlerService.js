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

    validateRequest: function (request, response, process) {
        if (!request.moduleName) {
            process.error(request, response, new CLASSES.NodicsError('ERR_EMS_00000', 'Invalid moduleName'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    handleResponsibilities: function (request, response, process) {
        this.startRemotePublishers(request.moduleName, request.remoteNode).then(() => {
            return this.startRemoteConsumers(request.moduleName, request.remoteNode);
        }).then(sucess => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    startRemotePublishers: function (moduleName, remoteNode) {
        return new Promise((resolve, reject) => {
            let publishers = {};
            if (!UTILS.isBlank(CONFIG.get('emsClient').publishers)) {
                Object.keys(CONFIG.get('emsClient').publishers).forEach(publisherName => {
                    let publisher = CONFIG.get('emsClient').publishers[publisherName];
                    if (publisher.runOnNode === remoteNode) {
                        publishers[publisherName] = _.merge({}, publisher);
                        publishers[publisherName].tempNode = CONFIG.get('nodeId');
                    }
                });
                if (!UTILS.isBlank(publishers)) {
                    let publisherList = Object.keys(publishers);
                    SERVICE.DefaultEmsClientConfigurationService.configurePublisher(Object.keys(publishers), publishers).then(success => {
                        let moduleObject = NODICS.getModule(moduleName);
                        let nodeConfig = moduleObject.nms.nodes[remoteNode];
                        if (!nodeConfig.remoteData) {
                            nodeConfig.remoteData = {};
                        }
                        nodeConfig.remoteData.publishers = publisherList;
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } else {
                resolve(true);
            }
        });
    },

    startRemoteConsumers: function (moduleName, remoteNode) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let consumers = {};
            if (!UTILS.isBlank(CONFIG.get('emsClient').consumers)) {
                Object.keys(CONFIG.get('emsClient').consumers).forEach(consumerName => {
                    let consumer = CONFIG.get('emsClient').consumers[consumerName];
                    if (consumer && consumer.runOnNode === remoteNode) {
                        consumers[consumerName] = _.merge({}, consumer);
                        consumers[consumerName].tempNode = CONFIG.get('nodeId');
                    }
                });
                if (!UTILS.isBlank(consumers)) {
                    let comsumerList = Object.keys(consumers);
                    SERVICE.DefaultEmsClientConfigurationService.registerConsumer(Object.keys(consumers), consumers).then(success => {
                        let moduleObject = NODICS.getModule(moduleName);
                        let nodeConfig = moduleObject.nms.nodes[remoteNode];
                        if (!nodeConfig.remoteData) {
                            nodeConfig.remoteData = {};
                        }
                        nodeConfig.remoteData.consumers = comsumerList;
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } else {
                resolve(true);
            }
        });
    }
};