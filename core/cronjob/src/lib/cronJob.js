/*
    Nodics - Enterprice API management framework

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
        console.log('    Creating job with time schedule : ', cronTime);
        _cronJob = new CronJob({
            cronTime: cronTime,
            onTick: function() {
                if (!_paused) {
                    _running = true;
                    SERVICE.JobHandlerService.handleJobTriggered(_definition, _cronJob);
                    try {
                        if (NODICS.getServerState() === 'started' && CONFIG.get('clusterId') === _definition.clusterId) {
                            eval(_definition.jobDetail.startNode + '(_definition, _cronJob)');
                        }
                    } catch (error) {
                        eval(_definition.jobDetail.errorNode + '(_definition, _cronJob, error)');
                    }
                    SERVICE.JobHandlerService.handleJobCompleted(_definition, _cronJob);
                    if (oneTime) {
                        _self.stopCronJob();
                    }
                }
            },
            onComplete: function() {
                if (!_paused) {
                    try {
                        if (_running && NODICS.getServerState() === 'started' && CONFIG.get('clusterId') === _definition.clusterId) {
                            eval(_definition.jobDetail.endNode + '(_definition, _cronJob)');
                        }
                    } catch (error) {
                        eval(_definition.jobDetail.errorNode + '(_definition, _cronJob, error)');
                    }
                    SERVICE.JobHandlerService.handleCronJobEnd(_definition, _cronJob);
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

    this.getName = function() {
        console.log('This function is for testing only');
    };
};