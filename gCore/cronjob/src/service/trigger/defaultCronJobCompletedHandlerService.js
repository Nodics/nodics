/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/service/trigger/DefaultCronJobCompletedHandlerService
 * @description Pipeline service for validating, governing, persisting, and publishing cronjob completion transitions.
 * @layer service
 * @owner cronjob
 * @override Project modules may override this handler to customize completion transition governance.
 */
module.exports = {
    /**
     * Initializes the cronjob completion handler during service loading.
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
     * Finalizes the cronjob completion handler after service loading.
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
     * Validates that completion pipeline input contains job and definition objects.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating job complete request');
        if (!request.job) {
            process.error(request, response, new CLASSES.NodicsError('ERR_JOB_00003', 'Invalid job detail to stop'));
        } else if (!request.definition) {
            process.error(request, response, new CLASSES.NodicsError('ERR_JOB_00003', 'Invalid job definition to stop'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Applies configured completion interceptors for the job.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    applyInterceptors: function (request, response, process) {
        let jobDefinition = request.definition;
        let interceptors = SERVICE.DefaultCronJobConfigurationService.getJobInterceptors(jobDefinition.code);
        if (interceptors && interceptors.completed) {
            this.LOG.debug('Applying pre job completed execution interceptors');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.completed), {
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
     * Applies configured completion validators for the job.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    applyValidators: function (request, response, process) {
        let jobDefinition = request.definition;
        let validators = SERVICE.DefaultCronJobConfigurationService.getJobValidators(request.tenant, jobDefinition.code);
        if (validators && validators.completed) {
            this.LOG.debug('Applying job completed execution validators');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.completed), {
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
     * Persists completion state and stop time for the job.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    stateChangeFinished: function (request, response, process) {
        this.LOG.debug('Changing job state to completed');
        let jobDefinition = request.definition;
        jobDefinition.stopTime = new Date();
        SERVICE.DefaultCronJobService.update({
            tenant: jobDefinition.tenant,
            query: {
                code: jobDefinition.code
            },
            model: {
                state: ENUMS.CronJobState.STOPED.key,
                stopTime: jobDefinition.stopTime
            }
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    /**
     * Publishes a configured job-completed event.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    triggerEvent: function (request, response, process) {
        try {
            let jobDefinition = request.definition;
            if (jobDefinition.event && jobDefinition.event.completed) {
                this.LOG.debug('Triggering event for Completed job');
                let event = {
                    tenant: jobDefinition.tenant,
                    active: true,
                    event: jobDefinition.code + 'JobCompleted',
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
    }
};
