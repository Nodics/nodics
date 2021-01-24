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


    handleItemChangeEvent: function (request, callback) {
        try {
            SERVICE.DefaultWorkflowService.handleItemChangeEvent(request).then(success => {
                if (success.errors && success.errors.length > 0) {
                    let error = new CLASSES.EventError(success.errors[0]);
                    if (success.errors.length > 1) {
                        success.errors.forEach(err => {
                            error.add(err);
                        });
                    }
                    error.metadata = {
                        result: success.result,
                    };
                    callback(error);
                } else {
                    callback(null, success.result);
                }
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle workflow item change', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle workflow item change', 'ERR_EVNT_00000'));
        }
    }
};