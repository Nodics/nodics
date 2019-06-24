/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    handleCronJobStart: function (definition, cronJob) {
        this.LOG.info('Job Started........ : ' + definition.name);
    },

    handleCronJobEnd: function (definition, cronJob) {
        this.LOG.info('Job End........ : ' + definition.name);
    },

    handleCronJobPaused: function (definition, cronJob) {
        this.LOG.info('Job End........ : ' + definition.name);
    },

    handleCronJobResumed: function (definition, cronJob) {
        this.LOG.info('Job End........ : ' + definition.name);
    },

    handleJobTriggered: function (definition, cronJob) {
        this.LOG.info('Job Triggered........ : ' + definition.name);
    },

    handleJobCompleted: function (definition, cronJob) {
        this.LOG.info('Job Completed........ : ' + definition.name);
    },

    handleSuccess: function (definition, job) {
        this.LOG.info('Job: ' + definition.code + ' finished successfully');
    },

    handleError: function (definition, job, error) {
        this.LOG.error('Please validate job definition for: ' + definition.code + ' Error: ' + error);
    }
};