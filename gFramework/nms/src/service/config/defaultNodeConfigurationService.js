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
    }
};