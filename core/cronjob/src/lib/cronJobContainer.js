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
    let _jobLOG = SYSTEM.createLogger('CronJob');

    this.LOG = SYSTEM.createLogger('CronJobContainer');

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
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject('Invalid cron job definition');
                }
            } else {
                reject('Invalid cron job definitions');
            }
        });
    };

    this.createCronJob = function (authToken, definition) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let currentDate = new Date();
            if (UTILS.isBlank(definition)) {
                reject('Invalid cron job definition');
            } else if (!definition.triggers || Object.keys(definition.triggers).length <= 0) {
                reject('Invalid cron job definition triggers');
            } else if (definition.active.start > currentDate) {
                reject('Job can not be started before its start date');
            } else if (definition.active.end && definition.active.end < currentDate) {
                reject('Job already expired');
            } else {
                if (!_jobPool[definition.code]) {
                    let cronJobs = [];
                    if (!definition.nodeId) {
                        definition.nodeId = CONFIG.get('nodeId');
                    }
                    definition.triggers.forEach(function (value) {
                        if (value.isActive && CONFIG.get('nodeId') === definition.nodeId) {
                            let tmpCronJob = new CLASSES.CronJob(definition, value); //TODO: need to add context and timeZone
                            tmpCronJob.LOG = _jobLOG;
                            tmpCronJob.validate();
                            tmpCronJob.init();
                            tmpCronJob.setAuthToken(authToken);
                            tmpCronJob.setJobPool(_jobPool);
                            cronJobs.push(tmpCronJob);

                        }
                    });
                    _jobPool[definition.code] = cronJobs;
                    resolve(definition.code);
                } else {
                    _self.LOG.warn('Definition ', definition.code, ' is already available.');
                    resolve(definition.code);
                }
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
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject('Invalid cron job definition');
                }
            } else {
                reject('Invalid cron job definitions');
            }
        });
    };

    this.updateCronJob = function (authToken, definition) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let currentDate = new Date();
            if (UTILS.isBlank(definition)) {
                reject('Invalid cron job definition');
            } else if (!definition.triggers || Object.keys(definition.triggers).length <= 0) {
                reject('Invalid cron job definition triggers');
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
            let success = {};
            let failed = {};
            if (!UTILS.isBlank(definitions)) {
                let allJob = [];
                let moduleObject = NODICS.getModule('cronjob');
                definitions.forEach((definition) => {
                    allJob.push(_self.runCronJob(moduleObject.metaData.authToken, definition));
                });
                if (allJob.length > 0) {
                    Promise.all(allJob).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject('Invalid cron job definition');
                }
            } else {
                reject('Invalid cron job definitions');
            }
        });
    };

    this.runCronJob = function (authToken, definition) {
        return new Promise((resolve, reject) => {
            let currentDate = new Date();
            if (UTILS.isBlank(definition)) {
                reject('Invalid cron job definition');
            } else if (!definition.triggers || Object.keys(definition.triggers).length <= 0) {
                reject('Invalid cron job definition triggers');
            } else if (definition.active.start > currentDate) {
                reject('Job can not be started before its start date');
            } else if (definition.active.end && definition.active.end < currentDate) {
                reject('Job already expired');
            } else {
                let _running = false;
                if (_jobPool[definition.code] && _jobPool[definition.code][0].isRunning()) {
                    _running = _jobPool[definition.code][0].isRunning();
                    _jobPool[definition.code].forEach(function (job) {
                        job.pauseCronJob();
                    });
                }
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
                resolve(definition.code);
            }
        });
    };

    this.startCronJobs = function (jobCodes) {
        let _self = this;
        let _success = {};
        let _failed = {};
        let response = {};
        jobCodes.forEach((value) => {
            try {
                _self.startCronJob(value);
                _success[value] = {
                    message: 'Successfully started'
                };
            } catch (error) {
                _failed[value] = error.toString();
            }
        });
        return {
            success: _success,
            failed: _failed
        };
    };

    this.startCronJob = function (jobCode) {
        if (jobCode && _jobPool[jobCode]) {
            _jobPool[jobCode].forEach(function (cronJob) {
                cronJob.startCronJob();
            });
        } else {
            throw new Error('Either name is not valid or job already removed.');
        }
    };

    this.stopCronJobs = function (jobCodes) {
        let _self = this;
        let _success = {};
        let _failed = {};
        let response = {};
        jobCodes.forEach((value) => {
            try {
                _self.stopCronJob(value);
                _success[value] = {
                    message: 'Successfully stoped'
                };
            } catch (error) {
                _failed[value] = error.toString();
            }
        });
        return {
            success: _success,
            failed: _failed
        };
    };

    this.stopCronJob = function (jobCode) {
        if (jobCode && _jobPool[jobCode]) {
            _jobPool[jobCode].forEach(function (cronJob) {
                cronJob.stopCronJob();
            });
        } else {
            throw new Error('Either name is not valid or job already removed.');
        }
    };

    this.removeCronJobs = function (jobCodes) {
        let _self = this;
        let _success = {};
        let _failed = {};
        let response = {};
        jobCodes.forEach((value) => {
            try {
                _self.removeCronJob(value);
                _success[value] = {
                    message: 'Successfully removed'
                };
            } catch (error) {
                _failed[value] = error.toString();
            }
        });
        return {
            success: _success,
            failed: _failed
        };
    };

    this.removeCronJob = function (jobCode) {
        if (jobCode && _jobPool[jobCode]) {
            _jobPool[jobCode].forEach(function (cronJob) {
                cronJob.stopCronJob();
            });
            delete _jobPool[jobCode];
        } else {
            throw new Error('Either name is not valid or job already removed.');
        }
    };

    this.pauseCronJobs = function (jobCodes) {
        let _self = this;
        let _success = {};
        let _failed = {};
        let response = {};
        jobCodes.forEach((value) => {
            try {
                _self.pauseCronJob(value);
                _success[value] = {
                    message: 'Successfully paused'
                };
            } catch (error) {
                _failed[value] = error.toString();
            }
        });
        return {
            success: _success,
            failed: _failed
        };
    };

    this.pauseCronJob = function (jobCode) {
        if (jobCode && _jobPool[jobCode]) {
            _jobPool[jobCode].forEach(function (cronJob) {
                cronJob.pauseCronJob();
            });
        } else {
            throw new Error('Given cronJob name is not valid');
        }
    };

    this.resumeCronJobs = function (jobCodes) {
        let _self = this;
        let _success = {};
        let _failed = {};
        let response = {};
        jobCodes.forEach((value) => {
            try {
                _self.resumeCronJob(value);
                _success[value] = {
                    message: 'Successfully resumed'
                };
            } catch (error) {
                _failed[value] = error.toString();
            }
        });
        return {
            success: _success,
            failed: _failed
        };
    };

    this.resumeCronJob = function (jobCode) {
        if (jobCode && _jobPool[jobCode]) {
            _jobPool[jobCode].forEach(function (cronJob) {
                cronJob.resumeCronJob();
            });
        } else {
            throw new Error('Given cronJob name is not valid');
        }
    };
};