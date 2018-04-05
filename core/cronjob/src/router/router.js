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
                operation: 'createJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/create',
                    body: 'All active jobs will be created'
                }
            },
            createPostJob: {
                secured: true,
                key: '/job/create',
                method: 'POST',
                controller: 'CronJobController',
                operation: 'createJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/create',
                    body: {
                        recursive: 'optional true/false - default is false',
                        pageSize: 'optional default value is 10',
                        pageNumber: 'optiona default value is 0',
                        sort: '',
                        select: '',
                        query: 'optional MongoDB based conditions can be put here, default is {}. If body not passed, all active jobs will be created'
                    }
                }
            },
            createGetJobByCode: {
                secured: true,
                key: '/job/create/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'createJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/create/:jobName',
                    body: 'Specific job will be created'
                }
            },
        },

        updateJob: {
            updateGetJob: {
                secured: true,
                key: '/job/update',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'updateJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/update',
                    body: 'All active jobs will be updated'
                }
            },
            updatePostJob: {
                secured: true,
                key: '/job/update',
                method: 'POST',
                controller: 'CronJobController',
                operation: 'updateJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/update',
                    body: {
                        recursive: 'optional true/false - default is false',
                        pageSize: 'optional default value is 10',
                        pageNumber: 'optiona default value is 0',
                        sort: '',
                        select: '',
                        query: 'optional MongoDB based conditions can be put here, default is {}. If body not passed, all active jobs will be updated'
                    }
                }
            },
            updateGetJobByCode: {
                secured: true,
                key: '/job/update/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'updateJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/update/:jobName',
                    body: 'Specific job will be updated'
                }
            },
        },

        runJob: {
            runGetJobByCode: {
                secured: true,
                key: '/job/run/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'runJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/run/:jobName',
                    body: 'Specific job will be executed'
                }
            },
        },

        startJob: {
            startGetJobByCode: {
                secured: true,
                key: '/job/start/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'startJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/start/:jobName',
                    body: 'Specific job will be started'
                }
            },
            startPostJob: {
                secured: true,
                key: '/job/start',
                method: 'POST',
                controller: 'CronJobController',
                operation: 'startJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/start',
                    body: ['job1', 'job2', 'job3', 'job...n']
                }
            },
        },

        stopJob: {
            stopGetJobByCode: {
                secured: true,
                key: '/job/stop/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'stopJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/stop/:jobName',
                    body: 'Specific job will be stoped'
                }
            },
            stopPostJob: {
                secured: true,
                key: '/job/stop',
                method: 'POST',
                controller: 'CronJobController',
                operation: 'stopJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/stop',
                    body: ['job1', 'job2', 'job3', 'job...n']
                }
            },
        },

        removeJob: {
            removeGetJobByCode: {
                secured: true,
                key: '/job/remove/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'removeJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/remove/:jobName',
                    body: 'Specific job will be removed'
                }
            },
            removePostJob: {
                secured: true,
                key: '/job/remove',
                method: 'POST',
                controller: 'CronJobController',
                operation: 'removeJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/remove',
                    body: ['job1', 'job2', 'job3', 'job...n']
                }
            },
        },

        pauseJob: {
            pauseGetJobByCode: {
                secured: true,
                key: '/job/pause/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'pauseJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/pause/:jobName',
                    body: 'Specific job will be paused'
                }
            },
            pausePostJob: {
                secured: true,
                key: '/job/pause',
                method: 'POST',
                controller: 'CronJobController',
                operation: 'pauseJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/pause',
                    body: ['job1', 'job2', 'job3', 'job...n']
                }
            },
        },

        resumeJob: {
            resumeGetJobByCode: {
                secured: true,
                key: '/job/resume/:jobName',
                method: 'GET',
                controller: 'CronJobController',
                operation: 'resumeJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/resume/:jobName',
                    body: 'Specific job will be resumed'
                }
            },
            resumePostJob: {
                secured: true,
                key: '/job/resume',
                method: 'POST',
                controller: 'CronJobController',
                operation: 'resumeJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/resume',
                    body: ['job1', 'job2', 'job3', 'job...n']
                }
            }
        }
    }
};