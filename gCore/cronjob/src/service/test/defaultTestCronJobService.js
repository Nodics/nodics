/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
