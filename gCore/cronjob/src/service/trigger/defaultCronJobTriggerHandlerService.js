/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/service/trigger/DefaultCronJobTriggerHandlerService
 * @description Pipeline service that governs cronjob execution, invokes configured job targets, persists results, and publishes execution events.
 * @layer service
 * @owner cronjob
 * @override Project modules may override this handler to customize job execution targets, validation, or result handling.
 */
module.exports = {
    /**
     * Initializes the cronjob trigger handler during service loading.
     *
     * @param {Object} options Loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the cronjob trigger handler after service loading.
     *
     * @param {Object} options Loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Validates that trigger pipeline input contains job, definition, and job detail.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating job trigger request');
        if (!request.job) {
            process.error(request, response, new CLASSES.NodicsError('ERR_JOB_00003', 'Invalid job detail to execute'));
        } else if (!request.definition) {
            process.error(request, response, new CLASSES.NodicsError('ERR_JOB_00003', 'Invalid job definition to execute'));
        } else if (!request.definition.jobDetail || UTILS.isBlank(request.definition.jobDetail)) {
            process.error(request, response, new CLASSES.NodicsError('ERR_JOB_00003', 'Invalid job detail'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Persists RUNNING state and start timing before job execution.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
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

    /**
     * Applies configured pre-run interceptors for the job.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    applyPreInterceptors: function (request, response, process) {
        let jobDefinition = request.definition;
        let interceptors = SERVICE.DefaultCronJobConfigurationService.getJobInterceptors(jobDefinition.code);
        if (interceptors && interceptors.preRun) {
            this.LOG.debug('Applying pre job execution interceptors');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.preRun), {
                job: request.job,
                definition: request.definition
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Applies configured pre-run validators for the job.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    applyPreValidators: function (request, response, process) {
        let jobDefinition = request.definition;
        let validators = SERVICE.DefaultCronJobConfigurationService.getJobValidators(request.tenant, jobDefinition.code);
        if (validators && validators.preRun) {
            this.LOG.debug('Applying job preRun execution validators');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.preRun), {
                job: request.job,
                definition: request.definition
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Executes the configured job target as service method, internal module call, or external request.
     *
     * @param {Object} request Pipeline request containing cronjob definition.
     * @param {Object} response Pipeline response receiving target output.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
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
            process.error(request, response, new CLASSES.NodicsError('ERR_JOB_00000', 'Invalid job detail to execute'));
        }
    },

    /**
     * Builds an authenticated internal module request for an internal cronjob target.
     *
     * @param {Object} definition Cronjob definition containing internal job detail.
     * @returns {Object} Module request descriptor.
     */
    prepareInternalURL: function (definition) {
        let jobDetail = definition.jobDetail.internal;
        let connectionType = 'abstract';
        let nodeId = CONFIG.get('nodeId');
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
            responseType: true,
            header: {
                Authorization: 'Bearer ' + NODICS.getInternalAuthToken(definition.tenant)
            }
        });
    },

    /**
     * Applies configured post-run validators for the job.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    applyPostValidators: function (request, response, process) {
        let jobDefinition = request.definition;
        let validators = SERVICE.DefaultCronJobConfigurationService.getJobValidators(request.tenant, jobDefinition.code);
        if (validators && validators.postRun) {
            this.LOG.debug('Applying job postRun execution validators');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.postRun), {
                job: request.job,
                definition: request.definition
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Applies configured post-run interceptors for the job.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre job execution interceptors');
        let jobDefinition = request.definition;
        let interceptors = SERVICE.DefaultCronJobConfigurationService.getJobInterceptors(jobDefinition.code);
        if (interceptors && interceptors.postRun) {
            this.LOG.debug('Applying postRun job execution interceptors');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.postRun), {
                job: request.job,
                definition: request.definition
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Publishes a configured job-executed event.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    triggerEvent: function (request, response, process) {
        try {
            let jobDefinition = request.definition;
            if (jobDefinition.event && jobDefinition.event.executed) {
                this.LOG.debug('Triggering event for Executed job');
                let event = {//Set tenant from CronJob Himkar
                    tenant: jobDefinition.tenant,
                    active: true,
                    event: jobDefinition.code + 'JobExecuted',
                    sourceName: 'cronjob',
                    sourceId: CONFIG.get('nodeId'),
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

    /**
     * Persists successful execution result and resolves the trigger pipeline.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response containing success payload.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
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
            if (!response.error) {
                response.error = new CLASSES.CronJobError(error, 'failed to update success response');
            } else {
                response.error.add(new CLASSES.CronJobError(error, 'failed to update success response'));
            }
            this.handleError(request, response, process);
        });
    },

    /**
     * Invokes an optional configured error node before persisting failed execution state.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response containing error payload.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        let definition = request.definition;
        if (definition.jobDetail && definition.jobDetail.errorNode) {
            let errorNode = definition.jobDetail.errorNode;
            let serviceName = errorNode.substring(0, errorNode.indexOf('.'));
            let functionName = errorNode.substring(errorNode.indexOf('.') + 1, errorNode.length);
            SERVICE[serviceName][functionName]({
                job: request.job,
                definition: definition,
                errors: response.error
            }).then(success => {
                this.handleError(request, response, process);
            }).catch(error => {
                response.error.add(error);
                this.handleError(request, response, process);
            });
        } else {
            this.handleError(request, response, process);
        }
    },

    /**
     * Persists failed execution result and rejects the trigger pipeline.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response containing error payload.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    handleError: function (request, response, process) {
        let jobDefinition = request.definition;
        jobDefinition.state = ENUMS.CronJobState.ACTIVE.key;
        jobDefinition.status = ENUMS.CronJobStatus.ERROR.key;
        jobDefinition.log = response.error.toJson();
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
            process.reject(response.error);
        }).catch(error => {
            process.reject(response.error);
        });
    }
};
