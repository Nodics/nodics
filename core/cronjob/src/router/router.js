/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    cronjob: {
        createJob: {
            createGetJob: {
                secured: true,
                key: '/job/create',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'createJob'
            },
            createPostJob: {
                secured: true,
                key: '/job/create',
                method: 'POST',
                controller: 'CronJobController',
                operation: 'createJob'
            },
            createGetJobByCode: {
                secured: true,
                key: '/job/create/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'createJob'
            },
        },

        updateJob: {
            updateGetJob: {
                secured: true,
                key: '/job/update',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'updateJob'
            },
            updatePostJob: {
                secured: true,
                key: '/job/update',
                method: 'POST',
                controller: 'CronJobController',
                operation: 'updateJob'
            },
            updateGetJobByCode: {
                secured: true,
                key: '/job/update/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'updateJob'
            },
        },

        runJob: {
            /*runGetJob: {
                secured: true,
                key: '/job/run',
                method: 'GET',
                controller: 'CONTROLLER.CronJobController.runJob'
            },
            runPostJob: {
                secured: true,
                key: '/job/run',
                method: 'POST',
                controller: 'CONTROLLER.CronJobController.runJob'
            },*/
            runGetJobByCode: {
                secured: true,
                key: '/job/run/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'runJob'
            },
        },

        startJob: {
            startGetJobByCode: {
                secured: true,
                key: '/job/start/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'startJob'
            },
            startPostJob: {
                secured: true,
                key: '/job/start',
                method: 'POST',
                controller: 'CronJobController',
                operation: 'startJob'
            },
        },

        stopJob: {
            stopGetJobByCode: {
                secured: true,
                key: '/job/stop/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'stopJob'
            },
            stopPostJob: {
                secured: true,
                key: '/job/stop',
                method: 'POST',
                controller: 'CronJobController',
                operation: 'stopJob'
            },
        },

        removeJob: {
            removeGetJobByCode: {
                secured: true,
                key: '/job/remove/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'removeJob'
            },
            removePostJob: {
                secured: true,
                key: '/job/remove',
                method: 'POST',
                controller: 'CronJobController',
                operation: 'removeJob'
            },
        },

        pauseJob: {
            pauseGetJobByCode: {
                secured: true,
                key: '/job/pause/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'pauseJob'
            },
            pausePostJob: {
                secured: true,
                key: '/job/pause',
                method: 'POST',
                controller: 'CronJobController',
                operation: 'pauseJob'
            },
        },

        resumeJob: {
            resumeGetJobByCode: {
                secured: true,
                key: '/job/resume/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'resumeJob'
            },
            resumePostJob: {
                secured: true,
                key: '/job/resume',
                method: 'POST',
                controller: 'CronJobController',
                operation: 'resumeJob'
            }
        }
    }
};