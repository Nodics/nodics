/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    createJob: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant,
            authToken: requestContext.authToken
        };
        if (requestContext.httpRequest) {
            request.options = {};
            if (!UTILS.isBlank(requestContext.httpRequest.body)) {
                request.options = requestContext.httpRequest.body;
            } else if (requestContext.httpRequest.params.jobName) {
                request.options.query = { name: requestContext.httpRequest.params.jobName };
            }
            FACADE.CronJobFacade.createJob(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    },

    updateJob: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant
        };
        if (requestContext.httpRequest) {
            request.options = {};
            if (!UTILS.isBlank(requestContext.httpRequest.body)) {
                request.options = requestContext.httpRequest.body;
            } else if (requestContext.httpRequest.params.jobName) {
                request.options.query = { name: requestContext.httpRequest.params.jobName };
            }
            FACADE.CronJobFacade.updateJob(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    },

    runJob: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant,
            authToken: requestContext.authToken
        };
        if (requestContext.httpRequest) {
            request.options = {};
            if (!UTILS.isBlank(requestContext.httpRequest.body)) {
                request.options = requestContext.httpRequest.body;
            } else if (requestContext.httpRequest.params.jobName) {
                request.options.query = { name: requestContext.httpRequest.params.jobName };
            }
            FACADE.CronJobFacade.runJob(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    },

    startJob: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant,
            jobNames: []
        };
        if (requestContext.httpRequest) {
            if (requestContext.httpRequest.params.jobName) {
                request.jobNames.push(requestContext.httpRequest.params.jobName);
            } else if (requestContext.httpRequest.body instanceof Array) {
                request.jobNames = requestContext.httpRequest.body;
            } else {
                console.log('   ERROR: Please validate your request, it is not a valid one');
                callback('ERROR: Please validate your request, it is not a valid one', null, request);
            }
            FACADE.CronJobFacade.startJob(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    },

    stopJob: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant,
            jobNames: []
        };
        if (requestContext.httpRequest) {
            if (requestContext.httpRequest.params.jobName) {
                request.jobNames.push(requestContext.httpRequest.params.jobName);
            } else if (requestContext.httpRequest.body instanceof Array) {
                request.jobNames = requestContext.httpRequest.body;
            } else {
                console.log('   ERROR: Please validate your request, it is not a valid one');
                callback('ERROR: Please validate your request, it is not a valid one', null, request);
            }
            FACADE.CronJobFacade.stopJob(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    },

    removeJob: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant,
            jobNames: []
        };
        if (requestContext.httpRequest) {
            if (requestContext.httpRequest.params.jobName) {
                request.jobNames.push(requestContext.httpRequest.params.jobName);
            } else if (requestContext.httpRequest.body instanceof Array) {
                request.jobNames = requestContext.httpRequest.body;
            } else {
                console.log('   ERROR: Please validate your request, it is not a valid one');
                callback('ERROR: Please validate your request, it is not a valid one', null, request);
            }
            FACADE.CronJobFacade.removeJob(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    },

    pauseJob: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant,
            jobNames: []
        };
        if (requestContext.httpRequest) {
            if (requestContext.httpRequest.params.jobName) {
                request.jobNames.push(requestContext.httpRequest.params.jobName);
            } else if (requestContext.httpRequest.body instanceof Array) {
                request.jobNames = requestContext.httpRequest.body;
            } else {
                console.log('   ERROR: Please validate your request, it is not a valid one');
                callback('ERROR: Please validate your request, it is not a valid one', null, request);
            }
            FACADE.CronJobFacade.pauseJob(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    },

    resumeJob: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant,
            jobNames: []
        };
        if (requestContext.httpRequest) {
            if (requestContext.httpRequest.params.jobName) {
                request.jobNames.push(requestContext.httpRequest.params.jobName);
            } else if (requestContext.httpRequest.body instanceof Array) {
                request.jobNames = requestContext.httpRequest.body;
            } else {
                console.log('   ERROR: Please validate your request, it is not a valid one');
                callback('ERROR: Please validate your request, it is not a valid one', null, request);
            }
            FACADE.CronJobFacade.resumeJob(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    }
};