/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    options: {
        isNew: true
    },

    handleCronJobStart: function(definition, cronJob) {
        console.log('Job Started........');
    },

    handleCronJobEnd: function(definition, cronJob) {
        console.log('Job End........');
    },

    handleCronJobPaused: function(definition, cronJob) {
        console.log('Job End........');
    },

    handleCronJobResumed: function(definition, cronJob) {
        console.log('Job End........');
    },

    handleJobTriggered: function(definition, cronJob) {
        console.log('Job Triggered........');
    },

    handleJobCompleted: function(definition, cronJob) {
        console.log('Job Completed........');
    },

    handleSuccess: function(definition, job) {
        //console.log('=============== handleSuccess');
        //throw new Error("Cron Job Error");
    },

    handleError: function(definition, job, error) {
        //console.log('=============== handleError : ', error);
    }
};