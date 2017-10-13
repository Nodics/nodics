const _ = require('lodash');
module.exports = function() {
    let _jobPool = {};

    this.createCronJobs = function(definitions) {
        let _self = this;
        let _success = {};
        let _failed = {};
        if (definitions) {
            definitions.forEach(function(definition) {
                try {
                    _self.createCronJob(definition);
                    _success[definition.name] = {
                        message: 'Successfully created'
                    };
                } catch (error) {
                    failed[definition.name] = error;
                    console.log('Error while creating job for : ', definition.name, ' ', error);
                }
            });
        } else {
            throw new Error('Invalid cron job definitions');
        }
        return {
            success: _success,
            failed: _failed
        };
    };

    this.createCronJob = function(definition) {
        if (!definition) {
            throw new Error('Invalid cron job definition');
        }
        if (!definition.triggers || Object.keys(definition.triggers).length <= 0) {
            throw new Error('Invalid cron job definition triggers');
        }
        if (!_jobPool[definition.name]) {
            let cronJobs = [];
            definition.triggers.forEach(function(value) {
                if (value.isActive && CONFIG.clusterId === definition.clusterId) {
                    let tmpCronJob = new CLASSES.CronJob(definition, value); //TODO: need to add context and timeZone
                    tmpCronJob.validate();
                    tmpCronJob.init();
                    cronJobs.push(tmpCronJob);
                }
            });
            _jobPool[definition.name] = cronJobs;
        } else {
            console.log('Definition ', definition.name, ' is already available.');
            throw new Error('Definition ', definition.name, ' is already available.');
        }
    };

    this.updateCronJobs = function(definitions) {
        let _self = this;
        let success = {};
        let failed = {};
        if (definitions) {
            definitions.forEach(function(definition) {
                try {
                    _self.updateCronJob(definition);
                    success[definition.name] = {
                        message: 'Successfully updated'
                    };
                } catch (error) {
                    failed[definition.name] = error;
                    console.log('Error while creating job for : ', definition.name, ' ', error);
                }
            });
        } else {
            throw new Error('Invalid cron job definitions');
        }
        return {
            success: success,
            failed: failed
        };
    };

    this.updateCronJob = function(definition) {
        if (!definition) {
            throw new Error('Invalid cron job definition');
        }
        if (!definition.triggers || Object.keys(definition.triggers).length <= 0) {
            throw new Error('Invalid cron job definition triggers');
        }
        if (!_jobPool[definition.name]) {
            this.createCronJob(definition);
        } else {
            tmpCronJob = _jobPool[definition.name];
            delete _jobPool[definition.name];
            let _running = tmpCronJob[0].isRunning();
            tmpCronJob.forEach(function(job) {
                job.stopCronJob();
            });
            this.createCronJob(definition);
            if (_running) {
                _jobPool[definition.name].forEach(function(job) {
                    job.startCronJob();
                });
            }
        }
    };

    this.runCronJobs = function(definitions) {
        let _self = this;
        let success = {};
        let failed = {};
        if (definitions) {
            definitions.forEach(function(definition) {
                try {
                    _self.runCronJob(definition);
                    success[definition.name] = {
                        message: 'Successfully executed'
                    };
                } catch (error) {
                    failed[definition.name] = error;
                    console.log('Error while executing job for : ', definition.name, ' ', error);
                }
            });
        } else {
            throw new Error('Invalid cron job definitions');
        }
        return {
            success: success,
            failed: failed
        };
    };

    this.runCronJob = function(definition) {
        if (!definition) {
            throw new Error('Invalid cron job definition');
        }
        let _running = false;
        if (_jobPool[definition.name] && _jobPool[definition.name][0].isRunning()) {
            _running = _jobPool[definition.name][0].isRunning();
            _jobPool[definition.name].forEach(function(job) {
                job.pauseCronJob();
            });
        }
        let tmpCronJob = new CLASSES.CronJob(definition, definition.triggers[0]); //TODO: need to add context and timeZone
        tmpCronJob.validate();
        tmpCronJob.init(true);
        if (_jobPool[definition.name] && _running) {
            _jobPool[definition.name].forEach(function(job) {
                job.resumeCronJob();
            });
        }
    };


    this.startCronJobs = function(jobNames) {
        let _self = this;
        let _success = {};
        let _failed = {};
        let response = {};
        if (jobNames) {
            jobNames.forEach((value) => {
                try {
                    _self.startCronJob(value);
                    _success[value] = {
                        message: 'Successfully started'
                    };
                } catch (error) {
                    _failed[value] = error;
                }
            });
        } else if (_jobPool && Object.keys(_jobPool).length) {
            _.each(_jobPool, function(valueIn, keyIn) {
                try {
                    _self.startCronJob(keyIn);
                    _success[keyIn] = {
                        message: 'Successfully started'
                    };
                } catch (error) {
                    _failed[keyIn] = error;
                }
            });
        } else {
            return {
                response: {
                    success: false,
                    code: 'ERR001',
                    msg: 'Job pool is empty'
                }
            };
        }
        return {
            response: {
                success: false,
                code: 'SUC001',
                msg: 'Finished Successfully',
                result: {
                    success: _success,
                    failed: _failed
                }
            }

        };
    };

    this.startCronJob = function(jobName) {
        if (jobName && _jobPool[jobName]) {
            _jobPool[jobName].forEach(function(cronJob) {
                cronJob.startCronJob();
            });
        } else {
            throw new Error('Either name is not valid or job already removed.');
        }
    };

    this.stopCronJobs = function(jobNames) {
        let _self = this;
        let _success = {};
        let _failed = {};
        let response = {};
        if (jobNames) {
            jobNames.forEach((value) => {
                try {
                    _self.stopCronJob(value);
                    _success[value] = {
                        message: 'Successfully stoped'
                    };
                } catch (error) {
                    _failed[value] = error;
                }
            });
        } else if (_jobPool && Object.keys(_jobPool).length) {
            _.each(_jobPool, function(valueIn, keyIn) {
                try {
                    _self.stopCronJob(keyIn);
                    _success[keyIn] = {
                        message: 'Successfully stoped'
                    };
                } catch (error) {
                    _failed[keyIn] = error;
                }
            });
        } else {
            return {
                response: {
                    success: false,
                    code: 'ERR001',
                    msg: 'Job pool is empty'
                }
            };
        }
        return {
            response: {
                success: false,
                code: 'SUC001',
                msg: 'Finished Successfully',
                result: {
                    success: _success,
                    failed: _failed
                }
            }

        };
    };

    this.stopCronJob = function(jobName) {
        if (jobName && _jobPool[jobName]) {
            _jobPool[jobName].forEach(function(cronJob) {
                cronJob.stopCronJob();
            });
        } else {
            throw new Error('Either name is not valid or job already removed.');
        }
    };

    this.removeCronJobs = function(jobNames) {
        let _success = {};
        let _failed = {};
        let response = {};
        if (jobNames) {
            jobNames.forEach((value) => {
                try {
                    _self.removeCronJob(value);
                    _success[value] = {
                        message: 'Successfully removed'
                    };
                } catch (error) {
                    _failed[value] = error;
                }
            });
        } else if (_jobPool && Object.keys(_jobPool).length) {
            _.each(_jobPool, function(valueIn, keyIn) {
                try {
                    _self.removeCronJob(keyIn);
                    _success[keyIn] = {
                        message: 'Successfully removed'
                    };
                } catch (error) {
                    _failed[keyIn] = error;
                }
            });
        } else {
            return {
                response: {
                    success: false,
                    code: 'ERR001',
                    msg: 'Job pool is empty'
                }
            };
        }
        return {
            response: {
                success: false,
                code: 'SUC001',
                msg: 'Finished Successfully',
                result: {
                    success: _success,
                    failed: _failed
                }
            }

        };
    };

    this.removeCronJob = function(jobName) {
        if (jobName && _jobPool[jobName]) {
            _jobPool[jobName].forEach(function(cronJob) {
                cronJob.stopCronJob();
            });
            _success[jobName] = _jobPool[jobName];
            delete _jobPool[jobName];
        } else {
            throw new Error('Either name is not valid or job already removed.');
        }
    };

    this.pauseCronJobs = function(jobNames) {
        let _success = {};
        let _failed = {};
        let response = {};
        if (jobNames) {
            jobNames.forEach((value) => {
                try {
                    _self.pauseCronJob(value);
                    _success[value] = {
                        message: 'Successfully paused'
                    };
                } catch (error) {
                    _failed[value] = error;
                }
            });
        } else if (_jobPool && Object.keys(_jobPool).length) {
            _.each(_jobPool, function(valueIn, keyIn) {
                try {
                    _self.pauseCronJob(keyIn);
                    _success[keyIn] = {
                        message: 'Successfully paused'
                    };
                } catch (error) {
                    _failed[keyIn] = error;
                }
            });
        } else {
            return {
                response: {
                    success: false,
                    code: 'ERR001',
                    msg: 'Job pool is empty'
                }
            };
        }
        return {
            response: {
                success: false,
                code: 'SUC001',
                msg: 'Finished Successfully',
                result: {
                    success: _success,
                    failed: _failed
                }
            }

        };
    };

    this.pauseCronJob = function(jobName) {
        if (jobName && _jobPool[jobName]) {
            _jobPool[jobName].forEach(function(cronJob) {
                cronJob.pauseCronJob();
            });
        } else {
            throw new Error('Given cronJob name is not valid');
        }
    };

    this.resumeCronJobs = function(jobNames) {
        let _success = {};
        let _failed = {};
        let response = {};
        if (jobNames) {
            jobNames.forEach((value) => {
                try {
                    _self.resumeCronJob(value);
                    _success[value] = {
                        message: 'Successfully resumed'
                    };
                } catch (error) {
                    _failed[value] = error;
                }
            });
        } else if (_jobPool && Object.keys(_jobPool).length) {
            _.each(_jobPool, function(valueIn, keyIn) {
                try {
                    _self.resumeCronJob(keyIn);
                    _success[keyIn] = {
                        message: 'Successfully resumed'
                    };
                } catch (error) {
                    _failed[keyIn] = error;
                }
            });
        } else {
            return {
                response: {
                    success: false,
                    code: 'ERR001',
                    msg: 'Job pool is empty'
                }
            };
        }
        return {
            response: {
                success: false,
                code: 'SUC001',
                msg: 'Finished Successfully',
                result: {
                    success: _success,
                    failed: _failed
                }
            }

        };
    };

    this.resumeCronJob = function(jobName) {
        if (jobName && _jobPool[jobName]) {
            _jobPool[jobName].forEach(function(cronJob) {
                cronJob.resumeCronJob();
            });
        } else {
            throw new Error('Given cronJob name is not valid');
        }
    };
};