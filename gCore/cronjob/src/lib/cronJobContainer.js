/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
module.exports = function () {
    let _jobPool = {};

    this.LOG = SERVICE.DefaultLoggerService.createLogger('CronJobContainer');

    this.createCronJobs = function (definitions) {
        return new Promise((resolve, reject) => {
            let _self = this;
            let moduleObject = NODICS.getModule('cronjob');
            if (!UTILS.isBlank(definitions)) {
                let allJob = [];
                definitions.forEach((definition) => {
                    allJob.push(_self.createCronJob(moduleObject.metaData.authToken, definition));
                });
                if (allJob.length > 0) {
                    Promise.all(allJob).then(success => {
                        resolve({
                            success: true,
                            code: 'SUC_JOB_00000',
                            result: success
                        });
                    }).catch(error => {
                        reject({
                            success: false,
                            code: 'ERR_JOB_00000',
                            error: error
                        });
                    });
                } else {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00001'
                    });
                }
            } else {
                reject({
                    success: false,
                    code: 'ERR_JOB_00001'
                });
            }
        });
    };

    this.createCronJob = function (authToken, definition) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let currentDate = new Date();
                if (UTILS.isBlank(definition)) {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00002'
                    });
                } else if (!definition.triggers || Object.keys(definition.triggers).length <= 0) {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00003'
                    });
                } else if (definition.start > currentDate) {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00004'
                    });
                } else if (definition.end && definition.end < currentDate) {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00005'
                    });
                } else {
                    if (!_jobPool[definition.code]) {
                        let cronJobs = [];
                        if (!definition.nodeId) {
                            definition.nodeId = CONFIG.get('nodeId');
                        }
                        definition.triggers.forEach(function (value) {
                            if (value.isActive && CONFIG.get('nodeId') === definition.nodeId) {
                                let tmpCronJob = new CLASSES.CronJob(definition, value); //TODO: need to add context and timeZone
                                tmpCronJob.LOG = SERVICE.DefaultLoggerService.createLogger('CronJob');
                                tmpCronJob.validate();
                                tmpCronJob.init();
                                tmpCronJob.setAuthToken(authToken);
                                tmpCronJob.setJobPool(_jobPool);
                                cronJobs.push(tmpCronJob);

                            }
                        });
                        _jobPool[definition.code] = cronJobs;
                        _self.LOG.debug('Job: ' + definition.code + ' has been successfully added in ready to run pool');
                        resolve('Job: ' + definition.code + ' has been successfully added in ready to run pool');
                    } else {
                        _self.LOG.warn('Job: ', definition.code, ' is already available.');
                        resolve('Job: ' + definition.code + ' is already available in ready to run pool');
                    }
                }
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_JOB_00000',
                    error: error
                });
            }
        });
    };

    this.updateCronJobs = function (definitions) {
        return new Promise((resolve, reject) => {
            let _self = this;
            let moduleObject = NODICS.getModule('cronjob');
            if (!UTILS.isBlank(definitions)) {
                let allJob = [];
                definitions.forEach((definition) => {
                    allJob.push(_self.updateCronJob(moduleObject.metaData.authToken, definition));
                });
                if (allJob.length > 0) {
                    Promise.all(allJob).then(success => {
                        resolve({
                            success: true,
                            code: 'SUC_JOB_00000',
                            result: success
                        });
                    }).catch(error => {
                        reject({
                            success: false,
                            code: 'ERR_JOB_00000',
                            error: error
                        });
                    });
                } else {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00001'
                    });
                }
            } else {
                reject({
                    success: false,
                    code: 'ERR_JOB_00001'
                });
            }
        });
    };

    this.updateCronJob = function (authToken, definition) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(definition)) {
                reject({
                    success: false,
                    code: 'ERR_JOB_00002'
                });
            } else if (!definition.triggers || Object.keys(definition.triggers).length <= 0) {
                reject({
                    success: false,
                    code: 'ERR_JOB_00003'
                });
            } else if (!_jobPool[definition.code]) {
                _self.LOG.debug('Could not found job, so creating new : ', definition.code);
                this.createCronJob(authToken, definition).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                let tmpCronJob = _jobPool[definition.code];
                let _running = tmpCronJob[0].isRunning();
                tmpCronJob.forEach((job) => {
                    job.stopCronJob();
                });
                delete _jobPool[definition.code];
                this.createCronJob(authToken, definition).then(success => {
                    if (_running) {
                        _jobPool[definition.code].forEach((job) => {
                            job.startCronJob();
                        });
                    }
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    };

    this.runCronJobs = function (definitions) {
        return new Promise((resolve, reject) => {
            let _self = this;
            if (!UTILS.isBlank(definitions)) {
                let allJob = [];
                let moduleObject = NODICS.getModule('cronjob');
                definitions.forEach((definition) => {
                    allJob.push(_self.runCronJob(moduleObject.metaData.authToken, definition));
                });
                if (allJob.length > 0) {
                    Promise.all(allJob).then(success => {
                        resolve({
                            success: true,
                            code: 'SUC_JOB_00000',
                            result: success
                        });
                    }).catch(error => {
                        reject({
                            success: false,
                            code: 'ERR_JOB_00000',
                            error: error
                        });
                    });
                } else {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00001'
                    });
                }
            } else {
                reject({
                    success: false,
                    code: 'ERR_JOB_00001'
                });
            }
        });
    };

    this.runCronJob = function (authToken, definition) {
        return new Promise((resolve, reject) => {
            try {
                let currentDate = new Date();
                if (UTILS.isBlank(definition)) {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00002'
                    });
                } else if (!definition.triggers || Object.keys(definition.triggers).length <= 0) {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00003'
                    });
                } else if (definition.start > currentDate) {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00004'
                    });
                } else if (definition.end && definition.end < currentDate) {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00005'
                    });
                } else {
                    let _running = false;
                    if (_jobPool[definition.code] && _jobPool[definition.code][0].isRunning()) {
                        _running = _jobPool[definition.code][0].isRunning();
                        _jobPool[definition.code].forEach(function (job) {
                            job.pauseCronJob();
                        });
                    }
                    if (!definition.nodeId || CONFIG.get('nodeId') === definition.nodeId) {
                        let tmpCronJob = new CLASSES.CronJob(definition, definition.triggers[0]); //TODO: need to add context and timeZone
                        tmpCronJob.LOG = _jobLOG;
                        tmpCronJob.validate();
                        tmpCronJob.setAuthToken(authToken);
                        tmpCronJob.init(true);
                        tmpCronJob.setJobPool(_jobPool);
                        if (_jobPool[definition.code] && _running) {
                            _jobPool[definition.code].forEach(function (job) {
                                job.resumeCronJob();
                            });
                        }
                    }
                    resolve('Job: ' + definition.code + ' executed successfully');
                }
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_JOB_00000',
                    error: error
                });
            }
        });
    };

    this.startCronJobs = function (jobCodes) {
        let _self = this;
        let _success = {};
        let _failed = {};
        jobCodes.forEach((value) => {
            try {
                _self.startCronJob(value);
                _success[value] = {
                    message: 'Job: ' + value + ' started successfully'
                };
            } catch (error) {
                _failed[value] = error.toString();
            }
        });
        return {
            success: true,
            code: '',
            result: _success,
            error: _failed
        };
    };

    this.startCronJob = function (jobCode) {
        if (jobCode && _jobPool[jobCode]) {
            _jobPool[jobCode].forEach(function (cronJob) {
                cronJob.startCronJob();
            });
        } else {
            throw new Error('Either jobCode' + jobCode + ' is not valid or job already removed.');
        }
    };

    this.stopCronJobs = function (jobCodes) {
        let _self = this;
        let _success = {};
        let _failed = {};
        jobCodes.forEach((value) => {
            try {
                _self.stopCronJob(value);
                _success[value] = {
                    message: 'Job: ' + value + ' stoped successfully'
                };
            } catch (error) {
                _failed[value] = error.toString();
            }
        });
        return {
            success: true,
            code: '',
            result: _success,
            error: _failed
        };
    };

    this.stopCronJob = function (jobCode) {
        if (jobCode && _jobPool[jobCode]) {
            _jobPool[jobCode].forEach(function (cronJob) {
                cronJob.stopCronJob();
            });
        } else {
            throw new Error('Either jobCode' + jobCode + ' is not valid or job already removed.');
        }
    };

    this.removeCronJobs = function (jobCodes) {
        let _self = this;
        let _success = {};
        let _failed = {};
        jobCodes.forEach((value) => {
            try {
                _self.removeCronJob(value);
                _success[value] = {
                    message: 'Job: ' + value + ' removed successfully'
                };
            } catch (error) {
                _failed[value] = error.toString();
            }
        });
        return {
            success: true,
            code: '',
            result: _success,
            error: _failed
        };
    };

    this.removeCronJob = function (jobCode) {
        if (jobCode && _jobPool[jobCode]) {
            _jobPool[jobCode].forEach(function (cronJob) {
                cronJob.stopCronJob();
            });
            delete _jobPool[jobCode];
        } else {
            throw new Error('Either jobCode' + jobCode + ' is not valid or job already removed.');
        }
    };

    this.pauseCronJobs = function (jobCodes) {
        let _self = this;
        let _success = {};
        let _failed = {};
        jobCodes.forEach((value) => {
            try {
                _self.pauseCronJob(value);
                _success[value] = {
                    message: 'Job: ' + value + ' paused successfully'
                };
            } catch (error) {
                _failed[value] = error.toString();
            }
        });
        return {
            success: true,
            code: '',
            result: _success,
            error: _failed
        };
    };

    this.pauseCronJob = function (jobCode) {
        if (jobCode && _jobPool[jobCode]) {
            _jobPool[jobCode].forEach(function (cronJob) {
                cronJob.pauseCronJob();
            });
        } else {
            throw new Error('Either jobCode' + jobCode + ' is not valid or job already removed.');
        }
    };

    this.resumeCronJobs = function (jobCodes) {
        let _self = this;
        let _success = {};
        let _failed = {};
        jobCodes.forEach((value) => {
            try {
                _self.resumeCronJob(value);
                _success[value] = {
                    message: 'Job: ' + value + ' resumed successfully'
                };
            } catch (error) {
                _failed[value] = error.toString();
            }
        });
        return {
            success: true,
            code: '',
            result: _success,
            error: _failed
        };
    };

    this.resumeCronJob = function (jobCode) {
        if (jobCode && _jobPool[jobCode]) {
            _jobPool[jobCode].forEach(function (cronJob) {
                cronJob.resumeCronJob();
            });
        } else {
            throw new Error('Either jobCode' + jobCode + ' is not valid or job already removed.');
        }
    };
};