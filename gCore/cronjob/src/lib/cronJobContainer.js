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

    this.createJobs = function (definitions, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!UTILS.isBlank(definitions)) {
                let definition = definitions.shift();
                _self.createJob(NODICS.getInternalAuthToken(definition.tenant), definition).then(success => {
                    result.push(success);
                    _self.createJobs(definitions, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error);
                    _self.createJobs(definitions, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve({
                    success: true,
                    code: 'SUC_JOB_00000',
                    result: result,
                    failed: failed
                });
            }
        });
    };

    this.createJob = function (authToken, definition) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let currentDate = new Date();
                if (UTILS.isBlank(definition)) {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00002'
                    });
                } else if (UTILS.isBlank(definition.trigger)) {
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
                        if (!definition.runOnNode) {
                            definition.runOnNode = CONFIG.get('nodeId');
                        }
                        if (CONFIG.get('nodeId') === definition.runOnNode) {
                            let tmpCronJob = new CLASSES.CronJob(definition, definition.trigger);
                            tmpCronJob.LOG = SERVICE.DefaultLoggerService.createLogger('CronJob-' + definition.code);
                            tmpCronJob.validate();
                            tmpCronJob.init();
                            tmpCronJob.setAuthToken(authToken);
                            tmpCronJob.setJobPool(_jobPool);
                            _jobPool[definition.code] = tmpCronJob;
                            SERVICE.DefaultCronJobService.update({
                                tenant: definition.tenant,
                                query: {
                                    code: definition.code
                                },
                                model: {
                                    state: ENUMS.CronJobState.CREATED.key
                                }
                            }).then(success => {
                                _self.LOG.debug('Job: ' + definition.code + ' has been successfully added in ready to run pool');
                            }).catch(error => {
                                delete _jobPool[definition.code];
                                _self.LOG.error('Job: ' + definition.code + ' failed on updating state');
                                _self.LOG.error(error);
                            });
                            resolve('Job: ' + definition.code + ' has been successfully added in ready to run pool');
                        } else {
                            _self.LOG.debug('Job: ' + definition.code + ' not set to run on this node');
                            resolve('Job: ' + definition.code + ' not set to run on this node');
                        }
                    } else {
                        _self.LOG.warn('Job: ', definition.code, ' is already available.');
                        resolve('Job: ' + definition.code + ' is already available in ready to run pool');
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    };

    this.updateJobs = function (definitions, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!UTILS.isBlank(definitions)) {
                let definition = definitions.shift();
                _self.updateJob(NODICS.getInternalAuthToken(definition.tenant), definition).then(success => {
                    result.push(success);
                    _self.updateJobs(definitions, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error);
                    _self.updateJobs(definitions, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve({
                    success: true,
                    code: 'SUC_JOB_00000',
                    result: result,
                    failed: failed
                });
            }
        });
    };

    this.updateJob = function (authToken, definition) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(definition)) {
                reject({
                    success: false,
                    code: 'ERR_JOB_00002'
                });
            } else if (UTILS.isBlank(definition.trigger)) {
                reject({
                    success: false,
                    code: 'ERR_JOB_00003'
                });
            } else if (!_jobPool[definition.code]) {
                _self.LOG.debug('Could not found job, so creating new : ', definition.code);
                this.createJob(authToken, definition).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                let cronJob = _jobPool[definition.code];
                let active = cronJob.isActive();
                cronJob.stopJob().then(success => {
                    delete _jobPool[definition.code];
                    this.createJob(authToken, definition).then(success => {
                        if (active) {
                            _jobPool[definition.code].startJob().then(success => {
                                resolve(success);
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            resolve(success);
                        }
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    _self.LOG.error(error);
                    reject('Job: ' + definition.code + ' failed to stop it to update');
                });
            }
        });
    };

    this.runJobs = function (definitions, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!UTILS.isBlank(definitions)) {
                let definition = definitions.shift();
                _self.runJob(NODICS.getInternalAuthToken(definition.tenant), definition).then(success => {
                    result.push(success);
                    _self.runJobs(definitions, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error);
                    _self.runJobs(definitions, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve({
                    success: true,
                    code: 'SUC_JOB_00000',
                    result: result,
                    failed: failed
                });
            }
        });
    };

    this.runJob = function (authToken, definition) {
        return new Promise((resolve, reject) => {
            try {
                let currentDate = new Date();
                if (UTILS.isBlank(definition)) {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00002'
                    });
                } else if (UTILS.isBlank(definition.trigger)) {
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
                } else if (_jobPool[definition.code] && _jobPool[definition.code].isRunning()) {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00006'
                    });
                } else {
                    let _active = false;
                    if (_jobPool[definition.code] && _jobPool[definition.code].isActive()) {
                        _active = _jobPool[definition.code].isActive();
                        _jobPool[definition.code].pauseJob(true);
                    }
                    if (!definition.runOnNode || CONFIG.get('nodeId') === definition.runOnNode) {
                        let tmpCronJob = new CLASSES.CronJob(definition, definition.trigger);
                        tmpCronJob.LOG = SERVICE.DefaultLoggerService.createLogger('CronJob-' + definition.code);
                        tmpCronJob.validate();
                        tmpCronJob.setAuthToken(authToken);
                        tmpCronJob.setJobPool(_jobPool);
                        tmpCronJob.init(true);
                        if (_jobPool[definition.code] && _active) {
                            _jobPool[definition.code].resumeJob(true);
                        }
                    }
                    resolve('Job: ' + definition.code + ' run successfully');
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

    this.startAllJobs = function () {
        return this.startJobs(Object.keys(_jobPool));
    };

    this.startJobs = function (jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.startJob(code).then(success => {
                    result.push(success);
                    _self.startJobs(jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.startJobs(jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve({
                    success: true,
                    code: 'SUC_JOB_00000',
                    result: result,
                    failed: failed
                });
            }
        });
    };

    this.startJob = function (jobCode) {
        return new Promise((resolve, reject) => {
            if (!_jobPool[jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job');
            } else {
                _jobPool[jobCode].startJob().then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    };

    this.stopJobs = function (jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.stopJob(code).then(success => {
                    result.push(success);
                    _self.stopJobs(jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.stopJobs(jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve({
                    success: true,
                    code: 'SUC_JOB_00000',
                    result: result,
                    failed: failed
                });
            }
        });
    };

    this.stopJob = function (jobCode) {
        return new Promise((resolve, reject) => {
            if (!_jobPool[jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job');
            } else {
                _jobPool[jobCode].stopJob().then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    };

    this.removeJobs = function (jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.removeJob(code).then(success => {
                    result.push(success);
                    _self.removeJobs(jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.removeJobs(jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve({
                    success: true,
                    code: 'SUC_JOB_00000',
                    result: result,
                    failed: failed
                });
            }
        });
    };

    this.removeJob = function (jobCode) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!_jobPool[jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job');
            } else {
                _jobPool[jobCode].stopJob().then(success => {
                    let definition = _jobPool[jobCode].getDefinition();
                    SERVICE.DefaultPipelineService.start('defaultCronJobRemovedHandlerPipeline', {
                        job: _jobPool[jobCode],
                        definition: definition
                    }, {}).then(success => {
                        delete _jobPool[jobCode];
                        resolve('Job: ' + definition.code + ' removed successfully');
                    }).catch(error => {
                        reject('Job: ' + definition.code + ' has issue while removing: ' + error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }
        });
    };

    this.pauseJobs = function (jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.pauseJob(code).then(success => {
                    result.push(success);
                    _self.pauseJobs(jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.pauseJobs(jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve({
                    success: true,
                    code: 'SUC_JOB_00000',
                    result: result,
                    failed: failed
                });
            }
        });
    };

    this.pauseJob = function (jobCode) {
        return new Promise((resolve, reject) => {
            if (!_jobPool[jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job');
            } else {
                _jobPool[jobCode].pauseJob().then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    };

    this.resumeJobs = function (jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.resumeJob(code).then(success => {
                    result.push(success);
                    _self.resumeJobs(jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.resumeJobs(jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve({
                    success: true,
                    code: 'SUC_JOB_00000',
                    result: result,
                    failed: failed
                });
            }
        });
    };

    this.resumeJob = function (jobCode) {
        return new Promise((resolve, reject) => {
            if (!_jobPool[jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job');
            } else {
                _jobPool[jobCode].resumeJob().then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    };
};