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
        jobDefinition.state = ENUMS.CronJobState.RUNNING.key;
        jobDefinition.lastEndTime = jobDefinition.endTime;
        SERVICE.DefaultCronJobService.update({
            tenant: jobDefinition.tenant,
            query: {
                code: jobDefinition.code
            },
            model: {
                state: ENUMS.CronJobState.RUNNING.key,
                startTime: jobDefinition.startTime,
                lastEndTime: jobDefinition.lastEndTime
            }
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    applyPreInterceptors: function (request, response, process) {
        let jobDefinition = request.definition;
        let interceptors = SERVICE.DefaultCronJobConfigurationService.getJobInterceptors(jobDefinition.code);
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
                response.success = success;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else if (jobDetail.internal) {
            let uri = this.prepareInternalURL(request.definition);
            SERVICE.DefaultModuleService.fetch(uri).then(success => {
                response.success = success;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else if (jobDetail.external) {
            SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildExternalRequest({
                header: jobDetail.external.header,
                uri: jobDetail.external.uri,
                methodName: jobDetail.external.methodName,
                requestBody: jobDetail.external.body,
                responseType: jobDetail.external.responseType,
                params: jobDetail.external.params
            })).then(success => {
                response.success = success;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.error(request, response, 'Invalid job detail to execute');
        }
    },

    prepareInternalURL: function (definition) {
        let jobDetail = definition.jobDetail.internal;
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
        let interceptors = SERVICE.DefaultCronJobConfigurationService.getJobInterceptors(jobDefinition.code);
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

    triggerEvent: function (request, response, process) {
        try {
            let jobDefinition = request.definition;
            if (jobDefinition.event && jobDefinition.event.executed) {
                this.LOG.debug('Triggering event for Executed job');
                let event = {//Set tenant from CronJob Himkar
                    tenant: jobDefinition.tenant,
                    active: true,
                    event: 'jobExecuted',
                    source: 'cronjob',
                    target: jobDefinition.event.targetModule,
                    state: "NEW",
                    type: (jobDefinition.event && jobDefinition.event.eventType) ? jobDefinition.event.eventType : 'ASYNC',
                    targetType: (jobDefinition.event && jobDefinition.event.targetType) ? jobDefinition.event.targetType : ENUMS.TargetType.MODULE.key,
                    targetNodeId: (jobDefinition.event && jobDefinition.event.targetNodeId) ? jobDefinition.event.targetNodeId : 0,
                    data: jobDefinition
                };
                this.LOG.debug('Pushing event for item created : ' + jobDefinition.code);
                SERVICE.DefaultEventService.publish(event).then(success => {
                    this.LOG.debug('Event successfully posted');
                }).catch(error => {
                    this.LOG.error('While posting model change event : ', error);
                });
            }
        } catch (error) {
            this.LOG.error('Facing issue while pushing save event : ', error);
        }
        process.nextSuccess(request, response);
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
        let jobDefinition = request.definition;
        jobDefinition.state = ENUMS.CronJobState.ACTIVE.key;
        jobDefinition.status = ENUMS.CronJobStatus.SUCCESS.key;
        jobDefinition.endTime = new Date();
        SERVICE.DefaultCronJobService.update({
            tenant: jobDefinition.tenant,
            query: {
                code: jobDefinition.code
            },
            model: {
                state: ENUMS.CronJobState.ACTIVE.key,
                status: ENUMS.CronJobStatus.SUCCESS.key,
                endTime: jobDefinition.endTime
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
        if (response.errors && response.errors.length >= 1) {
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
                definition: definition,
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
        jobDefinition.endTime = new Date();
        SERVICE.DefaultCronJobService.update({
            tenant: jobDefinition.tenant,
            query: {
                code: jobDefinition.code
            },
            model: {
                state: ENUMS.CronJobState.ACTIVE.key,
                status: ENUMS.CronJobStatus.ERROR.key,
                endTime: jobDefinition.endTime,
                log: response.errors
            }
        }).then(success => {
            process.reject(response.errors);
        }).catch(error => {
            process.reject(response.errors);
        });
    }
};