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

    this.createJobs = function (input, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!UTILS.isBlank(input.definitions)) {
                let definition = input.definitions.shift();
                definition.tenant = input.tenant;
                _self.createJob(NODICS.getInternalAuthToken(definition.tenant), definition).then(success => {
                    result.push(success);
                    _self.createJobs(input, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error);
                    _self.createJobs(input, result, failed).then(success => {
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
                } else if (UTILS.isBlank(definition.tenant)) {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00007'
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
                    if (!_jobPool[definition.tenant]) {
                        _jobPool[definition.tenant] = {};
                    }
                    if (!_jobPool[definition.tenant][definition.code]) {
                        if (CONFIG.get('nodeId') === definition.runOnNode || (definition.tempNode && CONFIG.get('nodeId') === definition.tempNode)) {
                            let tmpCronJob = new CLASSES.CronJob(definition, definition.trigger);
                            tmpCronJob.LOG = SERVICE.DefaultLoggerService.createLogger('CronJob-' + definition.code);
                            tmpCronJob.validate();
                            tmpCronJob.init();
                            tmpCronJob.setAuthToken(authToken);
                            tmpCronJob.setJobPool(_jobPool);
                            _jobPool[definition.tenant][definition.code] = tmpCronJob;
                            SERVICE.DefaultCronJobService.update({
                                tenant: definition.tenant,
                                query: {
                                    code: definition.code
                                },
                                model: {
                                    state: ENUMS.CronJobState.CREATED.key
                                }
                            }).then(success => {
                                _self.LOG.debug('Job: ' + definition.code + ' has been successfully added in ready to run pool on tenant: ' + definition.tenant);
                            }).catch(error => {
                                delete _jobPool[definition.code];
                                _self.LOG.error('Job: ' + definition.code + ' failed on updating state on tenant: ' + definition.tenant);
                                _self.LOG.error(error);
                            });
                            resolve({
                                success: true,
                                code: 'SUC_JOB_00000',
                                msg: 'Job: ' + definition.code + ' has been successfully added in ready to run pool on tenant: ' + definition.tenant
                            });
                        } else {
                            _self.LOG.debug('Job: ' + definition.code + ' not set to run on this node on tenant: ' + definition.tenant);
                            resolve({
                                success: true,
                                code: 'SUC_CRON_00001',
                                msg: 'Job: ' + definition.code + ' not set to run on this node on tenant: ' + definition.tenant
                            });
                        }
                    } else {
                        _self.LOG.warn('Job: ' + definition.code, ' is already available on tenant: ' + definition.tenant);
                        resolve({
                            success: true,
                            code: 'SUC_JOB_00000',
                            msg: 'Job: ' + definition.code + ' is already available in ready to run pool on tenant: ' + definition.tenant
                        });
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    };

    this.updateJobs = function (input, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!UTILS.isBlank(input.definitions)) {
                let definition = input.definitions.shift();
                definition.tenant = input.tenant;
                _self.updateJob(NODICS.getInternalAuthToken(definition.tenant), definition).then(success => {
                    result.push(success);
                    _self.updateJobs(input, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error);
                    _self.updateJobs(input, result, failed).then(success => {
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
            } else if (UTILS.isBlank(definition.tenant)) {
                reject({
                    success: false,
                    code: 'ERR_JOB_00007'
                });
            } else if (UTILS.isBlank(definition.trigger)) {
                reject({
                    success: false,
                    code: 'ERR_JOB_00003'
                });
            } else if (!_jobPool[definition.tenant] || !_jobPool[definition.tenant][definition.code]) {
                _self.LOG.debug('Could not found job, so creating new : ' + definition.code);
                this.createJob(authToken, definition).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                let cronJob = _jobPool[definition.tenant][definition.code];
                let active = cronJob.isActive();
                cronJob.stopJob().then(success => {
                    delete _jobPool[definition.tenant][definition.code];
                    this.createJob(authToken, definition).then(success => {
                        if (active) {
                            _jobPool[definition.tenant][definition.code].startJob().then(success => {
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
                    reject('Job: ' + definition.code + ' failed to stop it to update on tenant: ' + definition.tenant);
                });
            }
        });
    };

    this.runJobs = function (input, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!UTILS.isBlank(input.definitions)) {
                let definition = input.definitions.shift();
                definition.tenant = input.tenant;
                _self.runJob(NODICS.getInternalAuthToken(definition.tenant), definition).then(success => {
                    result.push(success);
                    _self.runJobs(input, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error);
                    _self.runJobs(input, result, failed).then(success => {
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
                } else if (UTILS.isBlank(definition.tenant)) {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00007'
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
                } else if (_jobPool[definition.tenant] &&
                    _jobPool[definition.tenant][definition.code] &&
                    _jobPool[definition.tenant][definition.code].isRunning()) {
                    reject({
                        success: false,
                        code: 'ERR_JOB_00006'
                    });
                } else {
                    let _active = false;
                    if (_jobPool[definition.tenant] &&
                        _jobPool[definition.tenant][definition.code] &&
                        _jobPool[definition.tenant][definition.code].isActive()) {
                        _active = _jobPool[definition.code].isActive();
                        _jobPool[definition.tenant][definition.code].pauseJob(true);
                    }
                    if (!definition.runOnNode || CONFIG.get('nodeId') === definition.runOnNode) {
                        let tmpCronJob = new CLASSES.CronJob(definition, definition.trigger);
                        tmpCronJob.LOG = SERVICE.DefaultLoggerService.createLogger('CronJob-' + definition.code);
                        tmpCronJob.validate();
                        tmpCronJob.setAuthToken(authToken);
                        tmpCronJob.setJobPool(_jobPool);
                        tmpCronJob.init(true);
                        if (_active) {
                            _jobPool[definition.tenant][definition.code].resumeJob(true);
                        }
                    }
                    resolve('Job: ' + definition.code + ' run successfully on tenant: ' + definition.tenant);
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

    this.startAllJobs = function (tenants = NODICS.getActiveTenants()) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (tenants && tenants.length > 0) {
                let tenant = tenants.shift();
                if (_jobPool[tenant] && !UTILS.isBlank(_jobPool[tenant])) {
                    this.startJobs(tenant, Object.keys(_jobPool[tenant])).then(success => {
                        _self.startAllJobs(tenants).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    _self.startAllJobs(tenants).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    };

    this.startJobs = function (tenant, jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.startJob(tenant, code).then(success => {
                    result.push(success);
                    _self.startJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.startJobs(tenant, jobCodes, result, failed).then(success => {
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

    this.startJob = function (tenant, jobCode) {
        return new Promise((resolve, reject) => {
            if (!_jobPool[tenant] || !_jobPool[tenant][jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job on tenant: ' + tenant);
            } else {
                _jobPool[tenant][jobCode].startJob().then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    };

    this.stopJobs = function (tenant, jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.stopJob(tenant, code).then(success => {
                    result.push(success);
                    _self.stopJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.stopJobs(tenant, jobCodes, result, failed).then(success => {
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

    this.stopJob = function (tenant, jobCode) {
        return new Promise((resolve, reject) => {
            if (!_jobPool[tenant] || !_jobPool[tenant][jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job on tenant: ' + tenant);
            } else {
                _jobPool[tenant][jobCode].stopJob().then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    };

    this.removeAllJobs = function (tenants = NODICS.getActiveTenants()) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (tenants && tenants.length > 0) {
                let tenant = tenants.shift();
                if (_jobPool[tenant] && !UTILS.isBlank(_jobPool[tenant])) {
                    this.removeJobs(tenant, Object.keys(_jobPool[tenant])).then(success => {
                        _self.removeAllJobs(tenants).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    _self.removeAllJobs(tenants).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    };

    this.removeJobs = function (tenant, jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.removeJob(tenant, code).then(success => {
                    result.push(success);
                    _self.removeJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.removeJobs(tenant, jobCodes, result, failed).then(success => {
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

    this.removeJob = function (tenant, jobCode) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!_jobPool[tenant] || !_jobPool[tenant][jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job');
            } else {
                _jobPool[tenant][jobCode].stopJob().then(success => {
                    let definition = _jobPool[tenant][jobCode].getDefinition();
                    SERVICE.DefaultPipelineService.start('defaultCronJobRemovedHandlerPipeline', {
                        job: _jobPool[tenant][jobCode],
                        definition: definition
                    }, {}).then(success => {
                        delete _jobPool[tenant][jobCode];
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

    this.pauseJobs = function (tenant, jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.pauseJob(tenant, code).then(success => {
                    result.push(success);
                    _self.pauseJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.pauseJobs(tenant, jobCodes, result, failed).then(success => {
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

    this.pauseJob = function (tenant, jobCode) {
        return new Promise((resolve, reject) => {
            if (!_jobPool[tenant] || !_jobPool[tenant][jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job on tenant: ' + tenant);
            } else {
                _jobPool[tenant][jobCode].pauseJob().then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    };

    this.resumeJobs = function (tenant, jobCodes, result = [], failed = []) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (jobCodes && jobCodes.length > 0) {
                let code = jobCodes.shift();
                _self.resumeJob(tenant, code).then(success => {
                    result.push(success);
                    _self.resumeJobs(tenant, jobCodes, result, failed).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    failed.push(error.message || error.msg || error.stack || error);
                    _self.resumeJobs(tenant, jobCodes, result, failed).then(success => {
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

    this.resumeJob = function (tenant, jobCode) {
        return new Promise((resolve, reject) => {
            if (!_jobPool[tenant] || !_jobPool[tenant][jobCode]) {
                resolve('Job: ' + jobCode + ' is not available in ready to run pool, please create this job on tenant: ' + tenant);
            } else {
                _jobPool[tenant][jobCode].resumeJob().then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    };
};