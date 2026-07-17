/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nNms/src/service/node/defaultNodeManagerService
 * @description Implements nNms default node manager service business behavior and extension logic.
 * @layer service
 * @owner nNms
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
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

    /**

     * Executes stop health check behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    stopHealthCheck: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let moduleObject = NODICS.getModule(moduleName);
                if (moduleObject.nms && moduleObject.nms.checker) {
                    clearInterval(moduleObject.nms.checker);
                }
                resolve({
                    code: 'SUC_SYS_00000',
                    message: 'Request processed successfuly'
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_SYS_00000'));
            }
        });
    },

    /**

     * Executes request responsibility behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    requestResponsibility: function (request) {
        return new Promise((resolve, reject) => {
            let moduleObject = NODICS.getModule(request.moduleName);
            if (request.nodeId === undefined) {
                reject(new CLASSES.NodicsError('ERR_SYS_00000', 'NodeId can not be null or empty'));
            } else if (!moduleObject.nms || !moduleObject.nms.nodes || !moduleObject.nms.nodes[request.nodeId] ||
                !moduleObject.nms.nodes[request.nodeId].requested || request.nodeId < CONFIG.get('nodeId')) {
                SERVICE.DefaultNodeConfigurationService.grantNodeResponsibility(request.moduleName, request.nodeId);
                resolve({
                    code: 'SUC_RES_00001',
                    message: 'Successfully granted request'
                });
            } else {
                reject(new CLASSES.NodicsError({
                    code: 'ERR_RES_00001',
                    message: 'Already handling responsibility',
                    metadata: {
                        nodeId: CONFIG.get('nodeId')
                    }
                }));
            }
        });
    },

    /**

     * Processes node activated behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    handleNodeActivated: function (request) {
        return new Promise((resolve, reject) => {
            if (request.nodeId === undefined) {
                reject(new CLASSES.NodicsError('ERR_SYS_00000', 'NodeId can not be null or empty'));
            } else {
                SERVICE.DefaultNodeConfigurationService.updateNodeActive(request.moduleName, request.nodeId);
                SERVICE.DefaultNodeStateChangeHandlerService.handleNodeActive(request.moduleName, request.nodeId).then(success => {
                    resolve({
                        code: 'SUC_SYS_00000',
                        message: 'Request processed successfuly'
                    });
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    /**

     * Executes notify node started behavior.

     *

     * @param {*} moduleList Method input.

     * @returns {*} Method result.

     */

    notifyNodeStarted: function (moduleList = Object.keys(CONFIG.get('nodePingableModules'))) {
        return new Promise((resolve, reject) => {
            if (moduleList && moduleList.length > 0) {
                let moduleName = moduleList.shift();
                let moduleConfig = CONFIG.get('nodePingableModules')[moduleName];
                if (moduleConfig && moduleConfig.enabled &&
                    NODICS.isModuleActive(moduleName) && UTILS.isRouterEnabled(moduleName)) {
                    let serverConfig = SERVICE.DefaultRouterService.getModuleServerConfig(moduleName);
                    SERVICE.DefaultNodeManagerService.notifyNode(moduleName, Object.keys(serverConfig.getNodes())).then(success => {
                        SERVICE.DefaultNodeManagerService.notifyNodeStarted(moduleList).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    SERVICE.DefaultNodeManagerService.notifyNodeStarted(moduleList).then(success => {
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

    /**

     * Executes notify node behavior.

     *

     * @param {*} moduleName Method input.

     * @param {*} nodes Method input.

     * @returns {*} Method result.

     */

    notifyNode: function (moduleName, nodes) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (nodes && nodes.length > 0) {
                let nodeId = nodes.shift();
                if (nodeId !== CONFIG.get('nodeId') && SERVICE.DefaultNodeConfigurationService.isNodeActive(moduleName, nodeId)) {
                    SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildRequest({
                        nodeId: nodeId,
                        moduleName: moduleName,
                        methodName: 'GET',
                        apiName: 'node/active/' + CONFIG.get('nodeId'),
                        requestBody: {},
                        responseType: true,
                        header: {
                            Authorization: 'Bearer ' + NODICS.getInternalAuthToken(CONFIG.get('defaultTenant') || 'default')
                        }
                    })).then(success => {
                        _self.LOG.info('Node: ' + nodeId + ' notified for node startup');
                        SERVICE.DefaultNodeConfigurationService.updateNodeActive(moduleName, nodeId);
                        _self.notifyNode(moduleName, nodes).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        SERVICE.DefaultNodeConfigurationService.updateNodeInActive(moduleName, nodeId);
                        if (error.error && error.error.code === 'ECONNREFUSED') {
                            _self.LOG.error('Node: ' + nodeId + ' is down at: ' + error.error.address + ' : ' + error.error.port);
                        } else {
                            _self.LOG.error(error);
                        }
                        _self.notifyNode(moduleName, nodes).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    });
                } else {
                    _self.notifyNode(moduleName, nodes).then(success => {
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

    /**

     * Validates active nodes rules.

     *

     * @returns {*} Method result.

     */

    checkActiveNodes: function () {
        let _self = this;
        let moduleList = Object.keys(CONFIG.get('nodePingableModules'));
        moduleList.forEach(moduleName => {
            let moduleConfig = CONFIG.get('nodePingableModules')[moduleName];
            let moduleObject = NODICS.getModule(moduleName);
            if (moduleConfig && moduleConfig.enabled &&
                NODICS.isModuleActive(moduleName) && UTILS.isRouterEnabled(moduleName)) {
                let serverConfig = SERVICE.DefaultRouterService.getModuleServerConfig(moduleName);
                moduleObject.nms = moduleObject.nms || {};
                moduleObject.nms.checker = setInterval(() => {
                    _self.checkActiveNode(moduleName, Object.keys(serverConfig.getNodes())).then(success => {
                        //_self.LOG.info('Done Module: ' + moduleName);
                    }).catch(error => {
                        _self.LOG.error('Error while pinging module for health check');
                        _self.LOG.error(error);
                    });
                }, CONFIG.get('nodePingTimeout') || 5000);
            }
        });
    },

    /**

     * Validates active node rules.

     *

     * @param {*} moduleName Method input.

     * @param {*} nodes Method input.

     * @returns {*} Method result.

     */

    checkActiveNode: function (moduleName, nodes) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (nodes && nodes.length > 0) {
                let nodeId = nodes.shift();
                if (nodeId !== CONFIG.get('nodeId') && SERVICE.DefaultNodeConfigurationService.isNodeActive(moduleName, nodeId)) {
                    SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildRequest({
                        nodeId: nodeId,
                        moduleName: moduleName,
                        methodName: 'GET',
                        apiName: 'ping',
                        requestBody: {},
                        responseType: true,
                        header: {
                            Authorization: 'Bearer ' + NODICS.getInternalAuthToken(CONFIG.get('defaultTenant') || 'default')
                        }
                    })).then(success => {
                        _self.checkActiveNode(moduleName, nodes).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        SERVICE.DefaultNodeConfigurationService.updateNodeInActive(moduleName, nodeId);
                        SERVICE.DefaultNodeStateChangeHandlerService.handleNodeInactive(moduleName, nodeId);
                        if (error.error && error.error.code === 'ECONNREFUSED') {
                            _self.LOG.error('   Node: ' + nodeId + ' is down at: ' + error.error.address + ' : ' + error.error.port);
                        } else {
                            _self.LOG.error(error);
                        }
                        resolve(true);
                    });
                } else {
                    _self.checkActiveNode(moduleName, nodes).then(success => {
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
