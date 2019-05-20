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
        this.LOG.debug('Validating job trigger request');
        if (!request.job) {
            process.error(request, response, 'Invalid job detail to execute');
        } else if (!request.definition) {
            process.error(request, response, 'Invalid job definition to execute');
        } else if (!request.definition.jobDetail || UTILS.isBlank(request.definition.jobDetail)) {
            process.error(request, response, 'Invalid job detail');
        } else {
            process.nextSuccess(request, response);
        }
    },

    stateChangeRunning: function (request, response, process) {
        this.LOG.debug('Changing job state to running');
        let jobDefinition = request.definition;
        SERVICE.DefaultCronJobService.update({
            tenant: jobDefinition.tenant,
            query: {
                code: jobDefinition.code
            },
            model: {
                state: ENUMS.CronJobState.RUNNING.key
            }
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    applyPreInterceptors: function (request, response, process) {
        let jobDefinition = request.definition;
        let interceptors = SERVICE.DefaultCronJobConfigurationService.getInterceptors(jobDefinition.code);
        if (interceptors && interceptors.preRun) {
            this.LOG.debug('Applying pre job execution interceptors');
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors([].concat(interceptors.preRun), {
                job: request.job,
                definition: request.definition
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_FIND_00004',
                    error: error.toString()
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    triggerProcess: function (request, response, process) {
        this.LOG.debug('Preparing output file path');
        let jobDetail = request.definition.jobDetail;
        if (jobDetail.startNode) {
            let serviceName = jobDetail.startNode.substring(0, jobDetail.startNode.indexOf('.'));
            let functionName = jobDetail.startNode.substring(jobDetail.startNode.indexOf('.') + 1, jobDetail.startNode.length);
            SERVICE[serviceName][functionName]({
                job: request.job,
                definition: request.definition
            }).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            SERVICE.DefaultModuleService.fetch(this.prepareURL(request.definition)).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        }
    },

    prepareURL: function (definition) {
        let jobDetail = definition.jobDetail;
        let connectionType = 'abstract';
        let nodeId = '0';
        if (jobDetail.nodeId) {
            connectionType = 'node';
            nodeId = jobDetail.nodeId;
        }
        return SERVICE.DefaultModuleService.buildRequest({
            connectionType: connectionType,
            nodeId: nodeId,
            moduleName: jobDetail.module,
            methodName: jobDetail.method,
            apiName: jobDetail.uri,
            requestBody: jobDetail.body || {},
            isJsonResponse: true,
            header: {
                authToken: NODICS.getInternalAuthToken(definition.tenant)
            }
        });
    },

    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre job execution interceptors');
        let jobDefinition = request.definition;
        let interceptors = SERVICE.DefaultCronJobConfigurationService.getInterceptors(jobDefinition.code);
        if (interceptors && interceptors.preRun) {
            this.LOG.debug('Applying pre job execution interceptors');
            SERVICE.DefaultInterceptorHandlerService.executeInterceptors([].concat(interceptors.preRun), {
                job: request.job,
                definition: request.definition
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, {
                    success: false,
                    code: 'ERR_FIND_00004',
                    error: error.toString()
                });
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
        let jobDefinition = request.definition;
        SERVICE.DefaultCronJobService.update({
            tenant: jobDefinition.tenant,
            query: {
                code: jobDefinition.code
            },
            model: {
                state: ENUMS.CronJobState.ACTIVE.key,
                status: ENUMS.CronJobStatus.SUCCESS.key
            }
        }).then(success => {
            process.resolve(response.success);
        }).catch(error => {
            process.resolve(response.success);
        });

    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        let errors = [];
        if (response.errors && response.errors.length > 1) {
            errors = response.errors;
        } else {
            errors.push(response.error);
        }
        response.errors = errors;
        let definition = request.definition;
        if (definition.jobDetail && definition.jobDetail.errorNode) {
            let errorNode = definition.jobDetail.errorNode;
            let serviceName = errorNode.substring(0, errorNode.indexOf('.'));
            let functionName = errorNode.substring(errorNode.indexOf('.') + 1, errorNode.length);
            SERVICE[serviceName][functionName]({
                job: request.job,
                definition: request.definition,
                errors: errors
            }).then(success => {
                this.handleError(request, response, process);
            }).catch(error => {
                response.errors.push(error);
                this.handleError(request, response, process);
            });
        } else {
            this.handleError(request, response, process);
        }
    },

    handleError: function (request, response, process) {
        let jobDefinition = request.definition;
        jobDefinition.state = ENUMS.CronJobState.ACTIVE.key;
        jobDefinition.status = ENUMS.CronJobStatus.ERROR.key;
        jobDefinition.log = response.errors;
        SERVICE.DefaultCronJobService.update({
            tenant: jobDefinition.tenant,
            query: {
                code: jobDefinition.code
            },
            model: jobDefinition
        }).then(success => {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: response.errors
            });
        }).catch(error => {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: response.errors
            });
        });
    }
};