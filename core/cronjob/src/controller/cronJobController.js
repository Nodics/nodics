/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    createJob: function(request, callback) {
        if (!request.local.recursive) {
            request.local.recursive = request.get('recursive') || false;
        }
        if (!UTILS.isBlank(request.body)) {
            request.local = _.merge(request.local || {}, request.body);
            FACADE.CronJobFacade.createJob(request, callback);
        } else if (request.params.jobName) {
            request.local.query = {
                name: request.params.jobName
            };
            FACADE.CronJobFacade.createJob(request, callback);
        } else {
            this.LOG.error('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    },

    updateJob: function(request, callback) {
        if (!request.local.recursive) {
            request.local.recursive = request.get('recursive') || false;
        }
        if (!UTILS.isBlank(request.body)) {
            request.local = _.merge(request.local || {}, request.body);
            FACADE.CronJobFacade.updateJob(request, callback);
        } else if (request.params.jobName) {
            request.local.query = {
                name: request.params.jobName
            };
            FACADE.CronJobFacade.updateJob(request, callback);
        } else {
            this.LOG.error('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    },

    runJob: function(request, callback) {
        if (request.params.jobName) {
            request.local.query = {
                name: request.params.jobName
            };
            FACADE.CronJobFacade.runJob(request, callback);
        } else {
            this.LOG.error('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    },

    startJob: function(request, callback) {
        request.local.jobNames = [];
        if (request.params.jobName) {
            request.local.jobNames.push(request.params.jobName);
            FACADE.CronJobFacade.startJob(request, callback);
        } else if (request.body instanceof Array) {
            request.local.jobNames = request.body;
            FACADE.CronJobFacade.startJob(request, callback);
        } else {
            this.LOG.error('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    },

    stopJob: function(request, callback) {
        request.local.jobNames = [];
        if (request.params.jobName) {
            request.local.jobNames.push(request.params.jobName);
            FACADE.CronJobFacade.stopJob(request, callback);
        } else if (request.body instanceof Array) {
            request.local.jobNames = request.body;
            FACADE.CronJobFacade.stopJob(request, callback);
        } else {
            this.LOG.error('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    },

    removeJob: function(request, callback) {
        request.local.jobNames = [];
        if (request.params.jobName) {
            request.local.jobNames.push(request.params.jobName);
            FACADE.CronJobFacade.removeJob(request, callback);
        } else if (request.body instanceof Array) {
            request.local.jobNames = request.body;
            FACADE.CronJobFacade.removeJob(request, callback);
        } else {
            this.LOG.error('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    },

    pauseJob: function(request, callback) {
        request.local.jobNames = [];
        if (request.params.jobName) {
            request.local.jobNames.push(request.params.jobName);
            FACADE.CronJobFacade.pauseJob(request, callback);
        } else if (request.body instanceof Array) {
            request.local.jobNames = request.body;
            FACADE.CronJobFacade.pauseJob(request, callback);
        } else {
            this.LOG.error('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    },

    resumeJob: function(request, callback) {
        request.local.jobNames = [];
        if (request.params.jobName) {
            request.local.jobNames.push(request.params.jobName);
            FACADE.CronJobFacade.resumeJob(request, callback);
        } else if (request.body instanceof Array) {
            request.local.jobNames = request.body;
            FACADE.CronJobFacade.resumeJob(request, callback);
        } else {
            this.LOG.error('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    }
};