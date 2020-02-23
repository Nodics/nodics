/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */


const CronJob = require('cron').CronJob;

module.exports = function (definition, trigger, context, timeZone) {
    let _definition = definition;
    let _tenant = definition.tenant;
    let _trigger = trigger;
    let _context = context;
    let _timeZone = timeZone;
    let _cronJob = '';
    let _active = false;
    let _running = false;
    let _paused = false;
    let _authToken = '';

    this.getCronJob = function () {
        return _cronJob;
    };

    this.getDefinition = function () {
        return _definition;
    };

    this.getTrigger = function () {
        return _trigger;
    };

    this.setJobPool = function (jobPool) {
        _jobPool = jobPool;
    };

    this.setAuthToken = function (authToken) {
        _authToken = authToken;
    };

    this.getAuthToken = function () {
        return _authToken;
    };

    this.getTenant = function () {
        return _tenant;
    };

    this.validate = function () {
        if (!_trigger.expression) {
            throw new Error('Invalid expression for given trigger');
        }
        if (!_definition.jobDetail) {
            throw new Error('Invalid job detail within cronJob definition');
        }
    };

    this.init = function (oneTime) {
        let _self = this;
        let cronTime = this.getCronTime(oneTime);
        var currentTime = new Date();
        _self.LOG.info('###### Creating job: ' + _definition.code + ' tenant: ' + definition.tenant + ' with time schedule : ' + cronTime, ' at: ' + currentTime.getHours(), ':' + currentTime.getMinutes(), ':' + currentTime.getSeconds());
        _cronJob = new CronJob({
            cronTime: cronTime,
            onTick: function () {
                try {
                    if (_active && !_paused && !_running) {
                        let cronJob = _self.getCronJob();
                        let startTime = new Date();
                        if (_definition.end && _definition.end < new Date()) {
                            _self.LOG.warn('   WARN: Job : ' + _definition.code + ' got expired. hence has been stopped');
                            _self.stopJob(true);
                        }
                        if (NODICS.getServerState() === 'started' && (CONFIG.get('nodeId') === _definition.runOnNode || CONFIG.get('nodeId') === definition.tempNode)) {
                            _running = true;
                            _definition.startTime = startTime;
                            _self.LOG.info('--->> job triggered : ' + _definition.code + ' tenant: ' + definition.tenant + ' at: ' + _definition.startTime.getHours() + ':' + _definition.startTime.getMinutes() + ':' + _definition.startTime.getSeconds());
                            SERVICE.DefaultPipelineService.start('defaultCronJobTriggerHandlerPipeline', {
                                job: _self,
                                cronJob: cronJob,
                                definition: _definition
                            }, {}).then(success => {
                                _running = false;
                                let endTime = new Date();
                                //_self.LOG.warn('Job : '+ _definition.code+ ' completed its execution successfully');
                                if (_definition.logResult) {
                                    SERVICE.DefaultCronJobLogService.save({
                                        tenant: _definition.tenant,
                                        model: {
                                            jobCode: _definition.code,
                                            startTime: startTime,
                                            endTime: endTime,
                                            result: success
                                        }
                                    }).then(success => {
                                        _self.LOG.debug('Log has been updated successfully');
                                    }).catch(error => {
                                        _self.LOG.error('Failed updating log');
                                    });
                                }
                                if (oneTime) _self.stopJob(true);
                            }).catch(error => {
                                _running = false;
                                _definition.endTime = new Date();
                                _definition.error = error;
                                _self.LOG.error('Job: ' + _definition.code + ' has issue while execution: ', error);
                                if (_definition.logResult) {
                                    SERVICE.DefaultCronJobLogService.save({
                                        tenant: _definition.tenant,
                                        model: {
                                            jobCode: _definition.code,
                                            startTime: _definition.startTime,
                                            endTime: _definition.endTime,
                                            result: _definition.error
                                        }
                                    }).then(success => {
                                        _self.LOG.debug('Log has been updated successfully');
                                    }).catch(error => {
                                        _self.LOG.error('Failed updating log: ', error);
                                    });
                                }
                                if (oneTime) _self.stopJob(true);
                            });
                        }
                    }
                } catch (error) {
                    _self.handleError(error);
                }
            },
            onComplete: function () {
                try {
                    if (NODICS.getServerState() === 'started' && (CONFIG.get('nodeId') === _definition.runOnNode || CONFIG.get('nodeId') === definition.tempNode)) {
                        SERVICE.DefaultPipelineService.start('defaultCronJobCompleteHandlerPipeline', {
                            job: _self,
                            cronJob: _self.getCronJob(),
                            definition: _definition
                        }, {}).then(success => {
                            _self.LOG.warn('Job : ' + _definition.code + ' completes successfully');
                        }).catch(error => {
                            _self.LOG.error('Job: ' + _definition.code + ' has issue while onComplete: ', error);
                        });
                    }
                } catch (error) {
                    _self.handleError(error);
                }
                _active = false;
            },
            start: _definition.runOnInit,
            context: _context,
            timeZone: _timeZone
        });
        _active = false;
        if (oneTime) {
            _self.startJob(true);
        }
    };

    this.startJob = function (disablePipeline) {
        let _self = this;
        if (disablePipeline) {
            if (!_active) {
                _active = true;
                _paused = false;
                _cronJob.start();
            }
        } else {
            return new Promise((resolve, reject) => {
                if (!_active) {
                    _active = true;
                    _paused = false;
                    SERVICE.DefaultPipelineService.start('defaultCronJobStartHandlerPipeline', {
                        job: _self,
                        definition: _definition
                    }, {}).then(success => {
                        _cronJob.start();
                        resolve('Job: ' + _definition.code + ' started successfully');
                    }).catch(error => {
                        reject(new CLASSES.CronJobError(error, 'Job: ' + _definition.code + ' has issue while starting: '));
                    });
                } else {
                    resolve('Job: ' + _definition.code + ' is already running');
                }
            });
        }
    };

    this.stopJob = function (disablePipeline) {
        let _self = this;
        if (disablePipeline) {
            if (_active) {
                _active = false;
                _cronJob.stop();
            }
        } else {
            return new Promise((resolve, reject) => {
                if (_active) {
                    _active = false;
                    _cronJob.stop();
                    SERVICE.DefaultPipelineService.start('defaultCronJobStopHandlerPipeline', {
                        job: _self,
                        definition: _definition
                    }, {}).then(success => {
                        resolve('Job: ' + _definition.code + ' stoped successfully');
                    }).catch(error => {
                        reject(new CLASSES.CronJobError(error, 'Job: ' + _definition.code + ' has issue while stoping: '));
                    });
                } else {
                    resolve('Job: ' + _definition.code + ' is already stoped');
                }
            });
        }
    };

    this.pauseJob = function (disablePipeline) {
        let _self = this;
        if (disablePipeline) {
            if (_active && !_paused) {
                _paused = true;
            }
        } else {
            return new Promise((resolve, reject) => {
                if (_active && !_paused) {
                    _paused = true;
                    SERVICE.DefaultPipelineService.start('defaultCronJobPauseHandlerPipeline', {
                        job: _self,
                        definition: _definition
                    }, {}).then(success => {
                        resolve('Job: ' + _definition.code + ' paused successfully');
                    }).catch(error => {
                        reject(new CLASSES.CronJobError(error, 'Job: ' + _definition.code + ' has issue while stoping: '));
                    });
                } else {
                    resolve('Job: ' + _definition.code + ' is already paused');
                }
            });
        }
    };

    this.resumeJob = function (disablePipeline) {
        let _self = this;
        if (disablePipeline) {
            if (_active && _paused) {
                _paused = false;
            }
        } else {
            return new Promise((resolve, reject) => {
                if (_active && _paused) {
                    _paused = false;
                    SERVICE.DefaultPipelineService.start('defaultCronJobResumedHandlerPipeline', {
                        job: _self,
                        definition: _definition
                    }, {}).then(success => {
                        resolve('Job: ' + _definition.code + ' resumed successfully');
                    }).catch(error => {
                        reject(new CLASSES.CronJobError(error, 'Job: ' + _definition.code + ' has issue while resuming: ');
                    });
                } else {
                    resolve('Job: ' + _definition.code + ' is already resumed');
                }
            });
        }
    };

    this.isActive = function () {
        return _active;
    };

    this.isRunning = function () {
        return _running;
    };

    this.getCronTime = function (oneTime) {
        if (oneTime) {
            return '* * * * * *';
        } else if (_trigger.expression) {
            return _trigger.expression;
        }
        return _trigger.second || '*' +
            ' ' +
            _trigger.minute || '*' +
            ' ' +
            _trigger.hour || '*' +
            ' ' +
            _trigger.year || '*' +
            ' ' +
            _trigger.month || '*' +
            ' ' +
            _trigger.day || '*';
    };

    this.handleError = function (error) {
        _self.LOG.error('Job: ' + _definition.code + ' has issue while running: ', error);
        SERVICE.DefaultPipelineService.start('defaultCronJobErrorHandlerPipeline', {
            job: _self,
            definition: _definition,
            error: error
        }, {}).then(success => {
            _self.LOG.warn('Error for Job: ' + _definition.code + ' has been handled successfully');
        }).catch(error => {
            _self.LOG.warn('Failed to handle rror for Job: ' + _definition.code);
            _self.LOG.error(error);
        });
    };
};