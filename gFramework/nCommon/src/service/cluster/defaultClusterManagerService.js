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

    checkActiveClusters: function () {
        setTimeout(() => {
            SERVICE.DefaultClusterManagerService.checkActiveModuleClusters();
            SERVICE.DefaultClusterManagerService.checkActiveClusters();
        }, CONFIG.get('clusterPingTimeout') || 2000);
    },

    checkActiveModuleClusters: function () {
        let _self = this;
        let modules = Object.keys(CONFIG.get('clusteredModules'));
        let allModulePromises = [];
        modules.forEach(moduleName => {
            let isActive = CONFIG.get('clusteredModules')[moduleName];
            let moduleObject = NODICS.getModule(moduleName);
            if (isActive && NODICS.isModuleActive(moduleName) && moduleObject.metaData && moduleObject.metaData.publish) {
                let serverConfig = SERVICE.DefaultRouterService.getModuleServerConfig(moduleName);
                allModulePromises.push(_self.checkActiveCluster(moduleName, Object.keys(serverConfig.getNodes())));
            }
        });
        if (allModulePromises.length > 0) {
            Promise.all(allModulePromises).then(success => {
                _self.LOG.debug('Successfully completed cluster check');
            }).catch(error => {
                _self.LOG.error('Failed cluster check');
                _self.LOG.error(error);
            });
        }
    },

    checkActiveCluster: function (moduleName, nodes) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (nodes && nodes.length > 0) {
                let nodeId = parseInt(nodes.shift());
                if (nodeId !== CONFIG.get('nodeId')) {
                    SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildRequest({
                        nodeId: nodeId,
                        moduleName: moduleName,
                        methodName: 'GET',
                        apiName: 'ping',
                        requestBody: {},
                        isJsonResponse: true,
                        header: {
                            authToken: NODICS.getInternalAuthToken('default')
                        }
                    })).then(success => {
                        SERVICE.DefaultClusterStateChangeHandlerService.handleClusterActive(moduleName, nodeId);
                        _self.checkActiveCluster(moduleName, nodes).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        SERVICE.DefaultClusterStateChangeHandlerService.handleClusterInactive(moduleName, nodeId);
                        if (error.error && error.error.code === 'ECONNREFUSED') {
                            _self.LOG.error('Cluster node: ' + nodeId + ' is down at: ' + error.error.address + ' : ' + error.error.port);
                        } else {
                            _self.LOG.error(error);
                        }
                        resolve(true);
                    });
                } else {
                    _self.checkActiveCluster(moduleName, nodes).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    }
};