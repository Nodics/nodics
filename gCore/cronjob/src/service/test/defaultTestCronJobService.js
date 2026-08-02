/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cronjob/service/test/DefaultTestCronJobService
 * @description Sample cronjob target service used to validate scheduler execution and stop flows.
 * @layer service
 * @owner cronjob
 * @override Project modules should provide concrete job target services for real scheduled work.
 */
module.exports = {
    //Created this class to test if cronJob run process works fine

    /**
     * Sample job execution target that resolves with a cronjob success status.
     *
     * @param {Object} input Job input containing the runtime job definition.
     * @returns {Promise<Object>} Success status payload.
     */
    runJob: function (input) {
        return new Promise((resolve, reject) => {
            var today = new Date();
            this.LOG.info('CronJos:' + input.definition.code + ' : ' + input.definition.tenant + ' Started................ : ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds());
            resolve({
                code: 'SUC_JOB_00000',
                message: 'Successfully executed ' + input.definition.code + ' : ' + input.definition.tenant
            });
        });
    },

    /**
     * Sample job stop target that resolves with a cronjob success status.
     *
     * @param {Object} input Job input containing the runtime job definition.
     * @returns {Promise<Object>} Success status payload.
     */
    stopJob: function (input) {
        return new Promise((resolve, reject) => {
            var today = new Date();
            this.LOG.info('CronJos:' + input.definition.code + ' : ' + input.definition.tenant + ' Stoped................ : ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds());
            resolve({
                code: 'SUC_JOB_00000',
                message: 'Successfully completed ' + input.definition.code + ' : ' + input.definition.tenant
            });
        });
    }
};
