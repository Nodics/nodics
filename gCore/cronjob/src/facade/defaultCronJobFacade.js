/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/facade/DefaultCronJobFacade
 * @description Facade boundary that delegates cronjob lifecycle commands from controllers to the scheduler service.
 * @layer facade
 * @owner cronjob
 * @override Project modules may override this facade to add lifecycle authorization or orchestration behavior.
 */
module.exports = {

    /**
     * Delegates job creation to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    createJob: function (request) {
        return SERVICE.DefaultCronJobService.createJob(request);
    },

    /**
     * Delegates job refresh/update to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    updateJob: function (request) {
        return SERVICE.DefaultCronJobService.updateJob(request);
    },

    /**
     * Delegates one-time job execution to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    runJob: function (request) {
        return SERVICE.DefaultCronJobService.runJob(request);
    },

    /**
     * Delegates job start to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    startJob: function (request) {
        return SERVICE.DefaultCronJobService.startJob(request);
    },

    /**
     * Delegates job stop to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    stopJob: function (request) {
        return SERVICE.DefaultCronJobService.stopJob(request);
    },

    /**
     * Delegates job removal to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    removeJob: function (request) {
        return SERVICE.DefaultCronJobService.removeJob(request);
    },

    /**
     * Delegates job pause to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    pauseJob: function (request) {
        return SERVICE.DefaultCronJobService.pauseJob(request);
    },

    /**
     * Delegates job resume to `DefaultCronJobService`.
     *
     * @param {Object} request Cronjob lifecycle request.
     * @returns {Promise<Object>} Scheduler operation result.
     */
    resumeJob: function (request) {
        return SERVICE.DefaultCronJobService.resumeJob(request);
    }
};
