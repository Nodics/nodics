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

    handleClusterActive: function (moduleName, nodeId) {
        let moduleObject = NODICS.getModule(moduleName);
        if (!moduleObject) {
            throw new Error('Invalid module name: ' + moduleName);
        } else {
            if (!moduleObject.nodes) {
                moduleObject.nodes = {};
            }
            if (!moduleObject.nodes[nodeId]) {
                moduleObject.nodes[nodeId] = {
                    active: true
                };
            }
            let nodeData = moduleObject.nodes[nodeId];
            if (!nodeData.active) {
                // handle release responsibilities if this node own for others
                console.log(' ############################ marking node active: ' + nodeId);
                nodeData.active = true;
            }
        }
    },

    handleClusterInactive: function (moduleName, nodeId) {
        let moduleObject = NODICS.getModule(moduleName);
        if (!moduleObject) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!moduleObject.nodes || !moduleObject.nodes[nodeId] || !moduleObject.nodes[nodeId].active) {
            return;
        } else {
            let nodeData = moduleObject.nodes[nodeId];
            console.log(' ------------------------------------ making node inactive: ' + nodeId);
            // Cluster goes down and handle responsibility
            nodeData.active = false;
        }
    }

};