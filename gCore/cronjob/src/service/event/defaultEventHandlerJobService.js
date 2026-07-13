/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/service/event/DefaultEventHandlerJobService
 * @description Cronjob job implementation that triggers NEMS event processing and records job outcome.
 * @layer service
 * @owner cronjob
 * @override Project modules may override this service to customize event-processing job behavior.
 */
module.exports = {

    /**
     * Runs the event handler job and logs success or failure.
     *
     * @param {Object} definition Cronjob definition.
     * @param {Object} cronJob Runtime cron job instance.
     * @returns {void}
     */
    runJob: function (definition, cronJob) {
        let _self = this;
        this.triggerEventHandlerJob(definition, cronJob).then(response => {
            _self.LOG.debug('Job : executed successfuly');
        }).catch(error => {
            _self.LOG.error('Job : executed with error : ', error);
        });
    },

    /**
     * Prepares an internal request URL for NEMS event processing.
     *
     * @param {Object} definition Cronjob definition containing tenant and optional target node.
     * @returns {Object} Module request descriptor.
     */
    prepareURL: function (definition) {
        let connectionType = 'abstract';
        let nodeId = CONFIG.get('nodeId');
        if (definition.targetNodeId) {
            connectionType = 'node';
            nodeId = definition.targetNodeId;
        }
        return SERVICE.DefaultModuleService.buildRequest({
            connectionType: connectionType,
            nodeId: nodeId,
            moduleName: CONFIG.get('nemsModuleName') || 'nems',
            methodName: 'GET',
            apiName: '/event/process',
            requestBody: {},
            responseType: true,
            header: {
                Authorization: 'Bearer ' + NODICS.getInternalAuthToken(definition.tenant)
            }
        });
    },

    /**
     * Triggers event processing and updates job state/logs based on the result.
     *
     * @param {Object} definition Cronjob definition.
     * @param {Object} cronJob Runtime cron job instance.
     * @returns {Promise<Object>} Success response after outcome is recorded.
     */
    triggerEventHandlerJob: function (definition, cronJob) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultModuleService.fetch(this.prepareURL(definition, cronJob)).then(success => {
                    definition.lastResult = ENUMS.CronJobStatus.SUCCESS.key;
                    definition.state = ENUMS.CronJobState.FINISHED.key;
                    _self.LOG.debug('Event process triggered successfully');
                    _self.updateJobLog(definition, success);
                    _self.updateJob(definition);
                    resolve({
                        code: 'SUC_JOB_00000',
                        message: 'Job updated with success response'
                    });
                }).catch(error => {
                    _self.LOG.debug('Event process trigger failed : ', error);
                    definition.lastResult = ENUMS.CronJobStatus.ERROR.key;
                    definition.state = ENUMS.CronJobState.FINISHED.key;
                    _self.updateJobLog(definition, error);
                    _self.updateJob(definition);
                    resolve({
                        code: 'SUC_JOB_00000',
                        message: 'Job updated with error response'
                    });
                });
            } catch (error) {
                definition.lastResult = ENUMS.CronJobStatus.ERROR.key;
                definition.state = ENUMS.CronJobState.FINISHED.key;
                _self.updateJobLog(definition, (new CLASSES.NodicsError(error)).toJson());
                _self.updateJob(definition);
                resolve({
                    code: 'SUC_JOB_00000',
                    message: 'Job updated with error response'
                });
            }
        });
    },

    /**
     * Saves job execution log when the job definition enables result logging.
     *
     * @param {Object} definition Cronjob definition.
     * @param {*} log Execution result or error payload.
     * @returns {void}
     */
    updateJobLog: function (definition, log) {
        let _self = this;
        if (definition.logResult) {
            SERVICE.DefaultCronJobLogService.save({
                tenant: definition.tenant,
                model: {
                    jobCode: definition.code,
                    log: log
                }
            }).then(response => {
                _self.LOG.debug('Log for job: ' + definition.code + ' saved');
            }).catch(error => {
                _self.LOG.error('While saving log for job: ' + definition.code + ' error: ', error);
            });
        }
    },

    /**
     * Saves the latest result and state for the job definition.
     *
     * @param {Object} definition Cronjob definition with updated state fields.
     * @returns {void}
     */
    updateJob: function (definition) {
        let _self = this;
        SERVICE.DefaultCronJobService.save({
            tenant: definition.tenant,
            model: {
                code: definition.code,
                lastResult: definition.lastResult,
                state: definition.state
            }
        }).then(response => {
            _self.LOG.debug('Job : executed successfuly');
        }).catch(error => {
            _self.LOG.error('Job : executed with error : ', error);
        });
    }
};
