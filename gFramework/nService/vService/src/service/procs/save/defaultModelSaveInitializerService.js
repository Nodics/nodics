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

    saveModel: function (request, response, process) {
        this.LOG.debug('Saving model ');
        if (request.schemaModel.versioned) {
            request.schemaModel.saveVersionedItems(request).then(success => {
                let model = {
                    success: true,
                    code: 'SUC_SAVE_00000'
                };
                if (success && UTILS.isArray(success) && success.length > 0) {
                    model.result = success[0];
                } else {
                    model.result = success;
                }
                response.model = model;
                process.nextSuccess(request, response);
            }).catch(error => {
                this.LOG.error(error);
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SAVE_00000',
                    error: error.toString()
                });
            });
        } else {
            request.schemaModel.saveItems(request).then(success => {
                let model = {
                    success: true,
                    code: 'SUC_SAVE_00000'
                };
                if (success && UTILS.isArray(success) && success.length > 0) {
                    model.result = success[0];
                } else {
                    model.result = success;
                }
                response.model = model;
                process.nextSuccess(request, response);
            }).catch(error => {
                this.LOG.error(error);
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SAVE_00000',
                    error: error.toString()
                });
            });
        }
    },


};