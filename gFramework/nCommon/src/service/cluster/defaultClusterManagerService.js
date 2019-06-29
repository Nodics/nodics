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
        this.checkActiveModuleClusters().then(success => {
            this.LOG.info('Active cluster check activated');
            setTimeout(() => {
                SERVICE.DefaultClusterManagerService.checkActiveClusters();
            }, CONFIG.get('clusterPingTimeout') || 2000);
        }).catch(error => {
            this.LOG.info('Failed Activeting cluster check');
            setTimeout(() => {
                SERVICE.DefaultClusterManagerService.checkActiveClusters();
            }, CONFIG.get('clusterPingTimeout') || 2000);
        });

    },

    checkActiveModuleClusters: function (modules = Object.keys(CONFIG.get('clusteredModules'))) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (modules && modules.length > 0) {
                let moduleName = modules.shift();
                let isActive = CONFIG.get('clusteredModules')[moduleName];
                let moduleObject = NODICS.getModule(moduleName);
                if (isActive && NODICS.isModuleActive(moduleName) && moduleObject.metaData && moduleObject.metaData.publish) {
                    let serverConfig = SERVICE.DefaultRouterService.getModuleServerConfig(moduleName);
                    let nodes = Object.keys(serverConfig.getNodes());
                    _self.checkActiveCluster(moduleName, nodes).then(success => {
                        _self.checkActiveModuleClusters(modules).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    _self.checkActiveModuleClusters(modules).then(success => {
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

    checkActiveCluster: function (moduleName, nodes) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (nodes && nodes.length > 0) {
                let nodeId = nodes.shift();
                if (nodeId == CONFIG.get('nodeId')) {
                    // let serverConfig = SERVICE.DefaultRouterService.getModuleServerConfig(moduleName);
                    // let nodeObj = serverConfig.getNode(nodeId);
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
                        console.log(moduleName + ' -------------------: ' + success);
                        _self.checkActiveCluster(moduleName, nodes).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
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