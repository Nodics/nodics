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
        this.LOG.debug('Validating do update schema request');
        if (!request.searchModel) {
            process.error(request, response, new CLASSES.SearchNodics('ERR_SRCH_00003', 'Invalid search model or search is not active for this schema'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    prepareSchema: function (request, response, process) {
        this.LOG.debug('Validating do update schema request');
        let searchModel = request.searchModel;
        SERVICE[searchModel.searchEngine.getOptions().schemaHandler].prepareTypeSchema({
            indexName: searchModel.indexName,
            indexDef: searchModel.indexDef
        }).then(schemaDef => {
            if (schemaDef && !UTILS.isBlank(schemaDef)) {
                request.searchSchema = schemaDef;
                process.nextSuccess(request, response);
            } else {
                process.error(request, response, new CLASSES.SearchNodics('ERR_SRCH_00003', 'No definition found to update'));
            }
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post do update schema interceptors');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.preDoUpdateSchema) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preDoUpdateSchema), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchNodics(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPreValidators: function (request, response, process) {
        this.LOG.debug('Applying post do update schema validators');
        let indexName = request.indexName || request.searchModel.indexName;
        let validators = SERVICE.DefaultSearchConfigurationService.getSearchValidators(request.tenant, indexName);
        if (validators && validators.preDoUpdateSchema) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preDoUpdateSchema), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchNodics(error, null, 'ERR_SRCH_00007'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing do update schema query');
        request.searchModel.doUpdateSchema(request).then(result => {
            response.success = {
                code: 'SUC_SRCH_00000',
                result: result
            };
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    applyPostValidators: function (request, response, process) {
        this.LOG.debug('Applying post do update schema validators');
        let indexName = request.indexName || request.searchModel.indexName;
        let validators = SERVICE.DefaultSearchConfigurationService.getSearchValidators(request.tenant, indexName);
        if (validators && validators.postDoUpdateSchema) {
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postDoUpdateSchema), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchNodics(error, null, 'ERR_SRCH_00008'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post do update schema interceptors');
        let indexName = request.indexName || request.searchModel.indexName;
        let interceptors = SERVICE.DefaultSearchConfigurationService.getSearchInterceptors(indexName);
        if (interceptors && interceptors.postDoUpdateSchema) {
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postDoUpdateSchema), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.SearchNodics(error, null, 'ERR_SRCH_00008'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    }
};