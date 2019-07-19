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

    handleNodeDown: function (event, callback, request) {
        event.moduleConfig = CONFIG.get('nodePingableModules')[event.target];
        if (UTILS.isBlank(event.moduleConfig)) {
            throw new Error('Invalid target or module not enabled for NMS: ' + event.target);
        } else {
            SERVICE.DefaultPipelineService.start(event.moduleConfig.nodeDownHandler, event, {}).then(success => {
                callback(null, {
                    success: true,
                    code: 'SUC_EVNT_00000',
                    msg: 'Event processed successfuly'
                });
            }).catch(error => {
                callback(error);
            });
        }
    }
};