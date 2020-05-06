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

    handleNodeUp: function (event, callback, request) {
        event.moduleConfig = CONFIG.get('nodePingableModules')[event.target];
        event.moduleName = event.target;
        if (UTILS.isBlank(event.moduleConfig)) {
            throw new Error('Invalid target or module not enabled for NMS: ' + event.target);
        } else if (!event.localNode) {
            throw new Error('Invalid localNode value');
        } else if (!event.remoteNode) {
            throw new Error('Invalid remoteNode value');
        } else {
            let nmsData = NODICS.getModule(event.moduleName).nms.nodes[event.remoteNode];
            if (nmsData && nmsData.remoteData) {
                event.remoteData = nmsData.remoteData;
                SERVICE.DefaultPipelineService.start(event.moduleConfig.nodeUpHandler, event, {}).then(success => {
                    delete nmsData.remoteData;
                    delete nmsData.granted;
                    delete nmsData.responsibleNode;
                    callback(null, {
                        success: true,
                        code: 'SUC_EVNT_00000',
                        message: 'Event processed successfuly'
                    });
                }).catch(error => {
                    callback(error);
                });
            } else {
                callback(null, {
                    success: true,
                    code: 'SUC_EVNT_00000',
                    message: 'Nothing to release'
                });
            }
        }
    }
};