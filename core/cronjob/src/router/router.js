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
                controller: 'CONTROLLER.CronJobController.createJob'
            },
            createPostJob: {
                secured: true,
                key: '/job/create',
                method: 'POST',
                controller: 'CONTROLLER.CronJobController.createJob'
            },
            createGetJobByCode: {
                secured: true,
                key: '/job/create/:jobName',
                method: 'GET',
                controller: 'CONTROLLER.CronJobController.createJob'
            },
        },

        updateJob: {
            updateGetJob: {
                secured: true,
                key: '/job/update',
                method: 'GET',
                controller: 'CONTROLLER.CronJobController.updateJob'
            },
            updatePostJob: {
                secured: true,
                key: '/job/update',
                method: 'POST',
                controller: 'CONTROLLER.CronJobController.updateJob'
            },
            updateGetJobByCode: {
                secured: true,
                key: '/job/update/:jobName',
                method: 'GET',
                controller: 'CONTROLLER.CronJobController.updateJob'
            },
        },

        runJob: {
            runGetJob: {
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
            },
            runGetJobByCode: {
                secured: true,
                key: '/job/run/:jobName',
                method: 'GET',
                controller: 'CONTROLLER.CronJobController.runJob'
            },
        },

        startJob: {
            startGetJobByCode: {
                secured: true,
                key: '/job/start/:jobName',
                method: 'GET',
                controller: 'CONTROLLER.CronJobController.startJob'
            },
            startPostJob: {
                secured: true,
                key: '/job/start',
                method: 'POST',
                controller: 'CONTROLLER.CronJobController.startJob'
            },
        },

        stopJob: {
            stopGetJobByCode: {
                secured: true,
                key: '/job/stop/:jobName',
                method: 'GET',
                controller: 'CONTROLLER.CronJobController.stopJob'
            },
            stopPostJob: {
                secured: true,
                key: '/job/stop',
                method: 'POST',
                controller: 'CONTROLLER.CronJobController.stopJob'
            },
        },

        removeJob: {
            removeGetJobByCode: {
                secured: true,
                key: '/job/remove/:jobName',
                method: 'GET',
                controller: 'CONTROLLER.CronJobController.removeJob'
            },
            removePostJob: {
                secured: true,
                key: '/job/remove',
                method: 'POST',
                controller: 'CONTROLLER.CronJobController.removeJob'
            },
        },

        pauseJob: {
            pauseGetJobByCode: {
                secured: true,
                key: '/job/pause/:jobName',
                method: 'GET',
                controller: 'CONTROLLER.CronJobController.pauseJob'
            },
            pausePostJob: {
                secured: true,
                key: '/job/pause',
                method: 'POST',
                controller: 'CONTROLLER.CronJobController.pauseJob'
            },
        },

        resumeJob: {
            resumeGetJobByCode: {
                secured: true,
                key: '/job/resume/:jobName',
                method: 'GET',
                controller: 'CONTROLLER.CronJobController.resumeJob'
            },
            resumePostJob: {
                secured: true,
                key: '/job/resume',
                method: 'POST',
                controller: 'CONTROLLER.CronJobController.resumeJob'
            }
        }
    }
};