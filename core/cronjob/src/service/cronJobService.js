/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    cronJobContainer: new CLASSES.CronJobContainer(),

    getCronJobContainer: function() {
        return this.cronJobContainer;
    },

    createJob: function(request, callback) {
        DAO.CronJobDao.get(request).then((models) => {
            try {
                let result = this.cronJobContainer.createCronJobs(request, models);
                callback(null, result, request);
            } catch (error) {
                callback(error, null, request);
            }
        }).catch((error) => {
            callback(error, null, request);
        });
    },
    updateJob: function(request, callback) {
        DAO.CronJobDao.get(request).then((models) => {
            try {
                let result = this.cronJobContainer.updateCronJobs(request, models);
                callback(null, result, request);
            } catch (error) {
                callback(error, null, request);
            }
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    runJob: function(request, callback) {
        DAO.CronJobDao.get(request).then((models) => {
            try {
                let result = this.cronJobContainer.runCronJobs(request, models);
                callback(null, result, request);
            } catch (error) {
                callback(error, null, request);
            }
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    startJob: function(request, callback) {
        try {
            //let result = this.cronJobContainer.startCronJobs(request.jobNames);
            let result = this.cronJobContainer.startCronJobs(request);
            callback(null, result, request);
        } catch (error) {
            callback(error, null, request);
        }
    },

    stopJob: function(request, callback) {
        try {
            // let result = this.cronJobContainer.stopCronJobs(request.jobNames);
            let result = this.cronJobContainer.stopCronJobs(request);
            callback(null, result, request);
        } catch (error) {
            callback(error, null, request);
        }
    },

    removeJob: function(request, callback) {
        try {
            //let result = this.cronJobContainer.removeCronJobs(request.jobNames);
            let result = this.cronJobContainer.removeCronJobs(request.jobNames);
            callback(null, result, request);
        } catch (error) {
            callback(error, null, request);
        }
    },

    pauseJob: function(request, callback) {
        try {
            //let result = this.cronJobContainer.pauseCronJobs(request.jobNames);
            let result = this.cronJobContainer.pauseCronJobs(request);
            callback(null, result, request);
        } catch (error) {
            callback(error, null, request);
        }
    },

    resumeJob: function(request, callback) {
        try {
            let result = this.cronJobContainer.resumeCronJobs(request);
            //let result = this.cronJobContainer.resumeCronJobs(request.jobNames);
            callback(null, result, request);
        } catch (error) {
            callback(error, null, request);
        }
    },

    startOnStartup: function() {
        // TODO: need to run all cronJobs those are active and
        // startDate < CurrentDate AND endDate > currentDate
        /*if (CONFIG.get('startJobsOnStartup')) {
            if (NODICS.getServerState() === 'started') {
                SERVICE.CronJobService.create({}, (response, inputParam) => {
                    if (response.success === 'false') {
                        console.log('   ERROR: Something went wrong while creating CronJobs : ', response);
                    } else {
                        SERVICE.CronJobService.start({ jobName: 'all' }, (response, inputParam) => {
                            console.log('   INFO: triggered cronjob start process : ', response);
                        });
                    }
                });
            } else {
                setTimeout(SERVICE.CronJobService.startOnStartup, CONFIG.get('cronJobStartWaitInterval'));
            }
        }*/
    },
};