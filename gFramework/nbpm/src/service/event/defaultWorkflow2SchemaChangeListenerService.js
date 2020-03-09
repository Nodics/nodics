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

    handleWorkflow2SchemaUpdateEventHandler: function (event, callback) {
        try {
            SERVICE.DefaultWorkflow2SchemaService.workflow2SchemaUpdateEventHandler(event).then(success => {
                callback(null, {
                    code: 'SUC_EVNT_00000',
                    msg: success
                });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle workflow2schema update handler', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle workflow2schema update handler', 'ERR_EVNT_00000'));
        }
    }
};