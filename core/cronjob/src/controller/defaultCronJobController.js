/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    createJob: function (request, callback) {
        request = _.merge(request || {}, request.httpRequest.body);
        request.options = request.options || {};
        if (!request.options.recursive) {
            request.options.recursive = request.httpRequest.get('recursive') || false;
        }
        if (request.httpRequest.params.jobCode) {
            request.query = {
                code: request.httpRequest.params.jobCode
            };
        }
        if (callback) {
            if (!UTILS.isBlank(request.query)) {
                FACADE.DefaultCronJobFacade.createJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                callback('Please validate your request, it is not a valid one', null);
            }
        } else {
            if (!UTILS.isBlank(request.query)) {
                return FACADE.DefaultCronJobFacade.createJob(request);
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                return Promise.reject('Please validate your request, it is not a valid one');
            }
        }
    },

    updateJob: function (request, callback) {
        request = _.merge(request || {}, request.httpRequest.body);
        request.options = request.options || {};
        if (!request.options.recursive) {
            request.options.recursive = request.httpRequest.get('recursive') || false;
        }
        if (request.httpRequest.params.jobCode) {
            request.query = {
                code: request.httpRequest.params.jobCode
            };
        }
        if (callback) {
            if (!UTILS.isBlank(request.query)) {
                FACADE.DefaultCronJobFacade.updateJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                callback('Please validate your request, it is not a valid one', null);
            }
        } else {
            if (!UTILS.isBlank(request.query)) {
                return FACADE.DefaultCronJobFacade.updateJob(request);
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                return Promise.reject('Please validate your request, it is not a valid one');
            }
        }
    },

    runJob: function (request, callback) {
        if (request.httpRequest.params.jobCode) {
            request.query = {
                code: request.httpRequest.params.jobCode
            };
        }
        if (callback) {
            if (!UTILS.isBlank(request.query)) {
                FACADE.DefaultCronJobFacade.runJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                callback('Please validate your request, it is not a valid one');
            }
        } else {
            if (!UTILS.isBlank(request.query)) {
                return FACADE.DefaultCronJobFacade.runJob(request);
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                return Promise.reject('Please validate your request, it is not a valid one');
            }
        }
    },

    startJob: function (request, callback) {
        request.jobCodes = [];
        if (request.httpRequest.params.jobCode) {
            request.jobCodes.push(request.httpRequest.params.jobCode);
        } else if (request.httpRequest.body instanceof Array) {
            request.jobCodes = request.httpRequest.body;
        }
        if (callback) {
            if (request.jobCodes.length > 0) {
                FACADE.DefaultCronJobFacade.startJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                callback('Please validate your request, it is not a valid one', null, request);
            }
        } else {
            if (request.jobCodes.length > 0) {
                return FACADE.DefaultCronJobFacade.startJob(request);
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                return Promise.reject('Please validate your request, it is not a valid one');
            }
        }
    },

    stopJob: function (request, callback) {
        request.jobCodes = [];
        if (request.httpRequest.params.jobCode) {
            request.jobCodes.push(request.httpRequest.params.jobCode);
        } else if (request.httpRequest.body instanceof Array) {
            request.jobCodes = request.httpRequest.body;
        }
        if (callback) {
            if (request.jobCodes.length > 0) {
                FACADE.DefaultCronJobFacade.stopJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                callback('Please validate your request, it is not a valid one', null, request);
            }
        } else {
            if (request.jobCodes.length > 0) {
                return FACADE.DefaultCronJobFacade.stopJob(request);
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                return Promise.reject('Please validate your request, it is not a valid one');
            }
        }
    },

    removeJob: function (request, callback) {
        request.jobCodes = [];
        if (request.httpRequest.params.jobCode) {
            request.jobCodes.push(request.httpRequest.params.jobCode);
        } else if (request.httpRequest.body instanceof Array) {
            request.jobCodes = request.httpRequest.body;
        }
        if (callback) {
            if (request.jobCodes.length > 0) {
                FACADE.DefaultCronJobFacade.removeJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                callback('Please validate your request, it is not a valid one', null, request);
            }
        } else {
            if (request.jobCodes.length > 0) {
                return FACADE.DefaultCronJobFacade.removeJob(request);
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                return Promise.reject('Please validate your request, it is not a valid one');
            }
        }
    },

    pauseJob: function (request, callback) {
        request.jobCodes = [];
        if (request.httpRequest.params.jobCode) {
            request.jobCodes.push(request.httpRequest.params.jobCode);
        } else if (request.httpRequest.body instanceof Array) {
            request.jobCodes = request.httpRequest.body;
        }
        if (callback) {
            if (request.jobCodes.length > 0) {
                FACADE.DefaultCronJobFacade.pauseJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                callback('Please validate your request, it is not a valid one', null, request);
            }
        } else {
            if (request.jobCodes.length > 0) {
                return FACADE.DefaultCronJobFacade.pauseJob(request);
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                return Promise.reject('Please validate your request, it is not a valid one');
            }
        }
    },

    resumeJob: function (request, callback) {
        request.jobCodes = [];
        if (request.httpRequest.params.jobCode) {
            request.jobCodes.push(request.httpRequest.params.jobCode);
        } else if (request.body instanceof Array) {
            request.jobCodes = request.httpRequest.body;
        }
        if (callback) {
            if (request.jobCodes.length > 0) {
                FACADE.DefaultCronJobFacade.resumeJob(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                callback('Please validate your request, it is not a valid one', null, request);
            }
        } else {
            if (request.jobCodes.length > 0) {
                return FACADE.DefaultCronJobFacade.resumeJob(request);
            } else {
                this.LOG.error('Please validate your request, it is not a valid one');
                return Promise.reject('Please validate your request, it is not a valid one');
            }
        }
    }
};