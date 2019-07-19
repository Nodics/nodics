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

    handleNodeActive: function (moduleName, nodeId) {
        let _self = this;
        return new Promise((resolve, reject) => {
            SERVICE.DefaultEventService.handleEvent({
                event: {
                    event: 'nodeUpEvent',
                    localNode: CONFIG.get('nodeId'),
                    remoteNode: nodeId,
                    target: moduleName
                }
            }).then(success => {
                _self.LOG.debug('Handled node up event: ', success);
            }).catch(error => {
                _self.LOG.error('Failed handling event for node up', error);
            });
            resolve(true);
        });
    },

    handleNodeInactive: function (moduleName, nodeId) {
        let _self = this;
        let moduleObject = NODICS.getModule(moduleName);
        if (!moduleObject) {
            throw new Error('Invalid module name: ' + moduleName);
        } else {
            let nodeData = moduleObject.nodes[nodeId];
            if (!nodeData.requested && !nodeData.handled) {
                SERVICE.DefaultEventService.handleEvent({
                    event: {
                        event: 'nodeDownEvent',
                        localNode: CONFIG.get('nodeId'),
                        remoteNode: nodeId,
                        target: moduleName
                    }
                }).then(success => {
                    _self.LOG.debug('Handled node down event: ', success);
                }).catch(error => {
                    _self.LOG.error('Failed handling event for node down', error);
                });
            }
        }
    }
};