/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module service/vService/procs/update/DefaultModelsUpdateInitializerService
 * @description Version-aware override for the generated update pipeline
 * execution step. It delegates to versioned update behavior when the schema
 * model is marked `versioned`.
 * @layer service
 * @owner nService
 * @override Project modules may override this service to customize versioned
 * update semantics while preserving the update pipeline request/response/process
 * contract.
 *
 * @property {Object} request.schemaModel Generated schema model wrapper.
 * @property {Object} request.schemaModel.versioned Enables versioned persistence.
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
     * Executes update using versioned persistence when enabled.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing remove query');
        try {
            if (request.schemaModel.versioned) {
                request.schemaModel.updateVersionedItems(request).then(result => {
                    response.success = {
                        success: true,
                        code: 'SUC_UPD_00000',
                        result: result
                    };
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, {
                        success: false,
                        code: 'ERR_UPD_00000',
                        error: error
                    });
                });
            } else {
                request.schemaModel.updateItems(request).then(result => {
                    response.success = {
                        success: true,
                        code: 'SUC_UPD_00000',
                        result: result
                    };
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, {
                        success: false,
                        code: 'ERR_UPD_00000',
                        error: error
                    });
                });
            }
        } catch (error) {
            process.error(request, response, {
                success: false,
                code: 'ERR_UPD_00000',
                error: error
            });
        }
    },

};
