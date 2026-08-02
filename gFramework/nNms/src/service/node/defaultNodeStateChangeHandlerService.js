/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nNms/src/service/node/defaultNodeStateChangeHandlerService
 * @description Implements nNms default node state change handler service business behavior and extension logic.
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

     * Processes node active behavior.

     *

     * @param {*} moduleName Method input.

     * @param {*} nodeId Method input.

     * @returns {*} Method result.

     */

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

    /**

     * Processes node inactive behavior.

     *

     * @param {*} moduleName Method input.

     * @param {*} nodeId Method input.

     * @returns {*} Method result.

     */

    handleNodeInactive: function (moduleName, nodeId) {
        let _self = this;
        let moduleObject = NODICS.getModule(moduleName);
        if (!moduleObject) {
            throw new Error('Invalid module name: ' + moduleName);
        } else {
            let nodeData = moduleObject.nms.nodes[nodeId];
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