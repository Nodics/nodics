/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/service/trigger/DefaultCronJobErrorHandlerService
 * @description Pipeline service for validating, governing, persisting, and publishing cronjob error transitions.
 * @layer service
 * @owner cronjob
 * @override Project modules may override this handler to customize error transition governance.
 */
module.exports = {
    /**
     * Initializes the cronjob error handler during service loading.
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
     * Finalizes the cronjob error handler after service loading.
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
     * Validates that error pipeline input contains job and definition objects.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating job error request');
        if (!request.job) {
            process.error(request, response, new CLASSES.NodicsError('ERR_JOB_00003', 'Invalid job detail to error'));
        } else if (!request.definition) {
            process.error(request, response, new CLASSES.NodicsError('ERR_JOB_00003', 'Invalid job definition to error'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Applies configured error interceptors for the job.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    applyInterceptors: function (request, response, process) {
        let jobDefinition = request.definition;
        let interceptors = SERVICE.DefaultCronJobConfigurationService.getJobInterceptors(jobDefinition.code);
        if (interceptors && interceptors.error) {
            this.LOG.debug('Applying job error interceptors');
            SERVICE.DefaultInterceptorService.executeInterceptors([].concat(interceptors.error), {
                job: request.job,
                definition: request.definition
            }, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Applies configured error validators for the job.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    applyValidators: function (request, response, process) {
        let jobDefinition = request.definition;
        let validators = SERVICE.DefaultCronJobConfigurationService.getJobValidators(request.tenant, jobDefinition.code);
        if (validators && validators.error) {
            this.LOG.debug('Applying job error execution validators');
            SERVICE.DefaultValidatorService.executeValidators([].concat(validators.error), {
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
     * Persists the ERROR status for a failed job.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    stateChangeError: function (request, response, process) {
        this.LOG.debug('Changing job state to error');
        let jobDefinition = request.definition;
        jobDefinition.endTime = new Date();
        if (!jobDefinition.log) {
            jobDefinition.log = [];
        }
        jobDefinition.log.push(request.error);
        SERVICE.DefaultCronJobService.update({
            tenant: jobDefinition.tenant,
            query: {
                code: jobDefinition.code
            },
            model: {
                status: ENUMS.CronJobStatus.ERROR.key,
                endTime: jobDefinition.endTime,
                log: jobDefinition.log
            }
        }).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    /**
     * Publishes a configured job-error event.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     */
    triggerEvent: function (request, response, process) {
        try {
            let jobDefinition = request.definition;
            if (jobDefinition.event && jobDefinition.event.error) {
                this.LOG.debug('Triggering event for resumed job');
                let event = {
                    tenant: jobDefinition.tenant, //Set tenant from CronJob Himkar
                    active: true,
                    event: jobDefinition.code + 'JobError',
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
