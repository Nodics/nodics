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

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating do save request');
        try {
            let moduleName = request.schemaModel.moduleName;
            let tntCode = request.schemaModel.tenant;
            let searchEngine = NODICS.getTenantSearchEngine(moduleName, tntCode);
            if (!request.model && !UTILS.isBlank(request.model)) {
                throw new Error('Model object can not be null or blank');
            } else if (!searchEngine) {
                throw new Error('Search engine not available for module: ' + moduleName + ' and tenant: ' + tntCode);
            } else {
                let indexTypeName = request.schemaModel.schemaName;
                if (request.schemaModel.rawSchema.search && request.schemaModel.rawSchema.search.typeName) {
                    indexTypeName = request.schemaModel.rawSchema.search.typeName;
                }
                let indexDef = NODICS.getTenantRawSearchSchema(moduleName, tntCode, indexTypeName);
                if (indexDef) {
                    if (indexDef.enabled) {
                        request.rawSearchSchema = indexDef;
                        process.nextSuccess(request, response);
                    } else {
                        throw new Error('Search not enabled for model: ' + modelName);
                    }
                } else {
                    throw new Error('Search schema not available for module: ' + moduleName + ', tenant: ' + tntCode + ', index type: ' + indexTypeName);
                }
            }
        } catch (error) {
            process.error(request, response, {
                success: false,
                code: 'ERR_FIND_00000',
                error: error
            });
        }
    },

    buildOptions: function (request, response, process) {
        this.LOG.debug('Building query options');
        process.nextSuccess(request, response);
    },

    lookupCache: function (request, response, process) {
        process.nextSuccess(request, response);
    },

    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post get model interceptors');
        process.nextSuccess(request, response);
    },

    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing get query');
        request.schemaModel.doSave(request).then(result => {
            response.success = {
                success: true,
                code: 'SUC_SRCH_00000',
                result: result
            };
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00000',
                error: error
            });
        });
    },

    populateSubModels: function (request, response, process) {
        this.LOG.debug('Populating sub models');
        process.nextSuccess(request, response);
    },

    populateVirtualProperties: function (request, response, process) {
        this.LOG.debug('Populating virtual properties');
        process.nextSuccess(request, response);
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post model interceptors');
        process.nextSuccess(request, response);
    },

    updateCache: function (request, response, process) {
        this.LOG.debug('Updating cache for new Items');
        process.nextSuccess(request, response);
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
        process.resolve(response);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed and got errors');
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: response.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};