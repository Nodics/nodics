/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    handleCronJobStart: function(definition, cronJob) {
        this.LOG.info('   INFO: Job Started........ : ', definition.name);
    },

    handleCronJobEnd: function(definition, cronJob) {
        this.LOG.info('   INFO: Job End........ : ', definition.name);
    },

    handleCronJobPaused: function(definition, cronJob) {
        this.LOG.info('   INFO: Job End........ : ', definition.name);
    },

    handleCronJobResumed: function(definition, cronJob) {
        this.LOG.info('   INFO: Job End........ : ', definition.name);
    },

    handleJobTriggered: function(definition, cronJob) {
        this.LOG.info('   INFO: Job Triggered........ : ', definition.name);
    },

    handleJobCompleted: function(definition, cronJob) {
        this.LOG.info('   INFO: Job Completed........ : ', definition.name);
    },

    handleSuccess: function(definition, job) {
        //this.LOG.info('=============== handleSuccess');
        //throw new Error("Cron Job Error");
    },

    handleError: function(definition, job, error) {
        //this.LOG.info('=============== handleError : ', error);
    }
};