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
        this.LOG.debug('Validating request to assign item with workflow');
        if (!request.workflowCode) {
            process.error(request, response, 'Invalid request, workflow code can not be null or empty');
        } else if (!request.itemCode) {
            process.error(request, response, 'Invalid request, item code can not be null or empty');
        } else if (!request.schemaName && !request.indexName) {
            process.error(request, response, 'Invalid request, schema name or index name can not be null or empty');
        } else if (!request.moduleName) {
            process.error(request, response, 'Invalid request, module name can not be null or empty');
        } else if (!request.tenant) {
            process.error(request, response, 'Invalid request, tenant can not be null or empty');
        } else {
            process.nextSuccess(request, response);
        }
    },

    loadWorkflow: function (request, response, process) {
        this.LOG.debug('Loading workflow: ' + request.workflowCode);
        SERVICE.DefaultWorkflowHeadService.get({
            tenant: request.tenant,
            query: {
                code: request.workflowCode
            }
        }).then(response => {
            if (response.success && response.result.length > 0) {
                request.workflowHead = response.result[0];
                process.nextSuccess(request, response);
            } else {
                process.error(request, response, 'Invalid request, none workflows found for code: ' + request.workflowCode);
            }
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    createActiveItem: function (request, response, process) {
        this.LOG.debug('Create Workflow Active Item');
        request.workflowActiveItem = {
            item: {
                code: request.itemCode,
                moduleName: request.moduleName,
                indexName: request.indexName,
                schemaName: request.schemaName
            },
            workflowHead: {
                code: request.request.workflowCode
            },
            activeAction: {
                code: request.request.workflowCode
            }
        };
        process.nextSuccess(request, response);
    },

    applyPutInterceptors: function (request, response, process) {
        let interceptors = SERVICE.DefaultWorkflowConfigurationService.getWorkflowInterceptors(request.workflowCode);
        if (interceptors && interceptors.put) {
            this.LOG.debug('Applying put interceptors for workflow item creation');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.put), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SYS_00000',
                    error: error.toString()
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    applyPutValidators: function (request, response, process) {
        let validators = SERVICE.DefaultWorkflowConfigurationService.getWorkflowValidators(request.tenant, request.workflowCode);
        if (validators && validators.put) {
            this.LOG.debug('Applying put validators for workflow item creation');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.put), request, response).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_SYS_00000',
                    error: error.toString()
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    saveActiveItem: function (request, response, process) {
        process.nextSuccess(request, response);
    },

    triggerStart: function (request, response, process) {
        process.nextSuccess(request, response);
    },

    successEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
        process.resolve(response.success);
    },

    handleError: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
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
