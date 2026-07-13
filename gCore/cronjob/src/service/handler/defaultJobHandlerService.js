/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/service/handler/DefaultJobHandlerService
 * @description Default logging hooks for cronjob lifecycle events.
 * @layer service
 * @owner cronjob
 * @override Project modules may override this service to perform custom side effects on job lifecycle callbacks.
 */
module.exports = {

    /**
     * Logs cronjob start.
     *
     * @param {Object} definition Cronjob definition.
     * @param {Object} cronJob Runtime cron job instance.
     * @returns {void}
     */
    handleCronJobStart: function (definition, cronJob) {
        this.LOG.info('Job Started........ : ' + definition.name);
    },

    /**
     * Logs cronjob end.
     *
     * @param {Object} definition Cronjob definition.
     * @param {Object} cronJob Runtime cron job instance.
     * @returns {void}
     */
    handleCronJobEnd: function (definition, cronJob) {
        this.LOG.info('Job End........ : ' + definition.name);
    },

    /**
     * Logs cronjob pause.
     *
     * @param {Object} definition Cronjob definition.
     * @param {Object} cronJob Runtime cron job instance.
     * @returns {void}
     */
    handleCronJobPaused: function (definition, cronJob) {
        this.LOG.info('Job End........ : ' + definition.name);
    },

    /**
     * Logs cronjob resume.
     *
     * @param {Object} definition Cronjob definition.
     * @param {Object} cronJob Runtime cron job instance.
     * @returns {void}
     */
    handleCronJobResumed: function (definition, cronJob) {
        this.LOG.info('Job End........ : ' + definition.name);
    },

    /**
     * Logs cronjob trigger.
     *
     * @param {Object} definition Cronjob definition.
     * @param {Object} cronJob Runtime cron job instance.
     * @returns {void}
     */
    handleJobTriggered: function (definition, cronJob) {
        this.LOG.info('Job Triggered........ : ' + definition.name);
    },

    /**
     * Logs cronjob completion.
     *
     * @param {Object} definition Cronjob definition.
     * @param {Object} cronJob Runtime cron job instance.
     * @returns {void}
     */
    handleJobCompleted: function (definition, cronJob) {
        this.LOG.info('Job Completed........ : ' + definition.name);
    },

    /**
     * Logs successful job execution.
     *
     * @param {Object} definition Cronjob definition.
     * @param {Object} job Runtime job wrapper.
     * @returns {void}
     */
    handleSuccess: function (definition, job) {
        this.LOG.info('Job: ' + definition.code + ' finished successfully');
    },

    /**
     * Logs failed job execution.
     *
     * @param {Object} definition Cronjob definition.
     * @param {Object} job Runtime job wrapper.
     * @param {*} error Error payload.
     * @returns {void}
     */
    handleError: function (definition, job, error) {
        this.LOG.error('Please validate job definition for: ' + definition.code + ' Error: ', error);
    }
};
