/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nNms/src/service/config/defaultNodeConfigurationService
 * @description Implements nNms default node configuration service business behavior and extension logic.
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

     * Validates node active rules.

     *

     * @param {*} moduleName Method input.

     * @param {*} nodeId Method input.

     * @returns {*} Method result.

     */

    isNodeActive: function (moduleName, nodeId) {
        let moduleObject = NODICS.getModule(moduleName);
        if (!moduleObject) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!moduleObject.nms || !moduleObject.nms.nodes || !moduleObject.nms.nodes[nodeId] || moduleObject.nms.nodes[nodeId].active) {
            return true;
        } else {
            return false;
        }
    },

    /**

     * Updates node active information.

     *

     * @param {*} moduleName Method input.

     * @param {*} nodeId Method input.

     * @returns {*} Method result.

     */

    updateNodeActive: function (moduleName, nodeId) {
        let moduleObject = NODICS.getModule(moduleName);
        if (!moduleObject) {
            throw new Error('Module name: ' + moduleName + ' is invalid');
        } else {
            if (!moduleObject.nms) {
                moduleObject.nms = {};
            }
            if (!moduleObject.nms.nodes) {
                moduleObject.nms.nodes = {};
            }
            if (!moduleObject.nms.nodes[nodeId]) {
                moduleObject.nms.nodes[nodeId] = {
                    active: true
                };
            } else {
                moduleObject.nms.nodes[nodeId].active = true;
            }
        }
    },

    /**

     * Updates node in active information.

     *

     * @param {*} moduleName Method input.

     * @param {*} nodeId Method input.

     * @returns {*} Method result.

     */

    updateNodeInActive: function (moduleName, nodeId) {
        let moduleObject = NODICS.getModule(moduleName);
        if (!moduleObject) {
            throw new Error('Module name: ' + moduleName + ' is invalid');
        } else {
            if (!moduleObject.nms) {
                moduleObject.nms = {};
            }
            if (!moduleObject.nms.nodes) {
                moduleObject.nms.nodes = {};
            }
            if (!moduleObject.nms.nodes[nodeId]) {
                moduleObject.nms.nodes[nodeId] = {
                    active: false
                };
            } else {
                moduleObject.nms.nodes[nodeId].active = false;
            }
        }
    },

    /**

     * Executes grant node responsibility behavior.

     *

     * @param {*} moduleName Method input.

     * @param {*} nodeId Method input.

     * @returns {*} Method result.

     */

    grantNodeResponsibility: function (moduleName, nodeId) {
        let moduleObject = NODICS.getModule(moduleName);
        if (!moduleObject) {
            throw new Error('Module name: ' + moduleName + ' is invalid');
        } else {
            if (!moduleObject.nms) {
                moduleObject.nms = {};
            }
            if (!moduleObject.nms.nodes) {
                moduleObject.nms.nodes = {};
            }
            if (!moduleObject.nms.nodes[nodeId]) {
                moduleObject.nms.nodes[nodeId] = {
                    active: false
                };
            }
            let nodeConfig = moduleObject.nms.nodes[nodeId];
            nodeConfig.active = false;
            nodeConfig.granted = true;
            nodeConfig.responsibleNode = nodeId;
        }
    }
};