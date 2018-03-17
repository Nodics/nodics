/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const CronJob = require('cron').CronJob;
const async = require('async');

module.exports = function(definition, trigger, context, timeZone) {
    let _definition = definition;
    let _trigger = trigger;
    let _context = context;
    let _timeZone = timeZone;
    let _cronJob = '';
    let _running = false;
    let _paused = false;
    let _authToken = '';
    let _jobPool = [];

    this.setJobPool = function(jobPool) {
        _jobPool = jobPool;
    };

    this.setAuthToken = function(authToken) {
        _authToken = authToken;
    };

    this.getAuthToken = function() {
        return _authToken;
    };

    this.validate = function() {
        if (!_trigger.expression) {
            throw new Error('Invalid expression for given trigger');
        }
        if (!_definition.jobDetail) {
            throw new Error('Invalid job detail within cronJob definition');
        }
        if (!_definition.jobDetail.startNode) {
            throw new Error('Invalid service job node to start');
        }
        if (!_definition.jobDetail.endNode) {
            _definition.jobDetail.endNode = 'SERVICE.JobHandlerService.handleSuccess';
        }
        if (!_definition.jobDetail.errorNode) {
            _definition.jobDetail.errorNode = 'SERVICE.JobHandlerService.handleError';
        }
    };

    this.init = function(oneTime) {
        let _self = this;
        let cronTime = this.getCronTime(oneTime);
        _self.LOG.info('    Creating job with time schedule : ', cronTime);
        _cronJob = new CronJob({
            cronTime: cronTime,
            onTick: function() {
                if (!_paused) {
                    _running = true;
                    if (_definition.active.end && _definition.active.end < new Date()) {
                        _self.LOG.warn('   WARN: Job : ', _definition.name, ' got expired. hence has been stopped');
                        _self.stopCronJob();
                        delete _jobPool[_definition.name];
                    }
                    SERVICE.JobHandlerService.handleJobTriggered(_definition, _self);
                    try {
                        if (NODICS.getServerState() === 'started' && CONFIG.get('clusterId') === _definition.clusterId) {
                            eval(_definition.jobDetail.startNode + '(_definition, _self)');
                        }
                    } catch (error) {
                        eval(_definition.jobDetail.errorNode + '(_definition, _self, error)');
                    }
                    SERVICE.JobHandlerService.handleJobCompleted(_definition, _self);
                    if (oneTime) {
                        _self.stopCronJob();
                    }
                }
            },
            onComplete: function() {
                if (!_paused) {
                    try {
                        if (_running && NODICS.getServerState() === 'started' && CONFIG.get('clusterId') === _definition.clusterId) {
                            eval(_definition.jobDetail.endNode + '(_definition, _self)');
                        }
                    } catch (error) {
                        eval(_definition.jobDetail.errorNode + '(_definition, _self, error)');
                    }
                    SERVICE.JobHandlerService.handleCronJobEnd(_definition, _self);
                    _running = false;
                }
            },
            start: _definition.runOnInit,
            context: _context,
            timeZone: _timeZone
        });

        if (oneTime) {
            _self.startCronJob();
        }
    };

    this.startCronJob = function() {
        if (!_running) {
            _paused = false;
            async.parallel([
                function() {
                    SERVICE.JobHandlerService.handleCronJobStart(_definition, _cronJob);
                },
                function() {
                    _cronJob.start();
                }
            ]);
        }
    };

    this.stopCronJob = function() {
        if (_running) {
            _cronJob.stop();
        }
    };

    this.pauseCronJob = function() {
        if (_running) {
            _paused = true;
            SERVICE.JobHandlerService.handleCronJobPaused(_definition, _cronJob);
        }
    };

    this.resumeCronJob = function() {
        if (_running) {
            _paused = false;
            SERVICE.JobHandlerService.handleCronJobResumed(_definition, _cronJob);
        }
    };

    this.isRunning = function() {
        return _running;
    };

    this.getCronTime = function(oneTime) {
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
};