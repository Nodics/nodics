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
        this.LOG.debug('Validating job error request');
        if (!request.job) {
            process.error(request, response, new CLASSES.NodicsError('ERR_JOB_00003', 'Invalid job detail to error'));
        } else if (!request.definition) {
            process.error(request, response, new CLASSES.NodicsError('ERR_JOB_00003', 'Invalid job definition to error'));
        } else {
            process.nextSuccess(request, response);
        }
    },

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