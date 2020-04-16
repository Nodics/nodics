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
                accessGroups: ['adminGroup'],
                key: '/job/create',
                method: 'GET',
                controller: 'DefaultCronJobController',
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
                accessGroups: ['adminGroup'],
                key: '/job/create',
                method: 'POST',
                controller: 'DefaultCronJobController',
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
                accessGroups: ['adminGroup'],
                key: '/job/create/:jobCode',
                method: 'GET',
                controller: 'DefaultCronJobController',
                operation: 'createJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/create/:jobCode',
                    body: 'Specific job will be created'
                }
            },
        },

        updateJob: {
            updateGetJob: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/job/update',
                method: 'GET',
                controller: 'DefaultCronJobController',
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
                accessGroups: ['adminGroup'],
                key: '/job/update',
                method: 'POST',
                controller: 'DefaultCronJobController',
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
                accessGroups: ['adminGroup'],
                key: '/job/update/:jobCode',
                method: 'GET',
                controller: 'DefaultCronJobController',
                operation: 'updateJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/update/:jobCode',
                    body: 'Specific job will be updated'
                }
            },
        },

        runJob: {
            runGetJobByCode: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/job/run/:jobCode',
                method: 'GET',
                controller: 'DefaultCronJobController',
                operation: 'runJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/run/:jobCode',
                    body: 'Specific job will be executed'
                }
            },
        },

        startJob: {
            startGetJobByCode: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/job/start/:jobCode',
                method: 'GET',
                controller: 'DefaultCronJobController',
                operation: 'startJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/start/:jobCode',
                    body: 'Specific job will be started'
                }
            },
            startPostJob: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/job/start',
                method: 'POST',
                controller: 'DefaultCronJobController',
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
                accessGroups: ['adminGroup'],
                key: '/job/stop/:jobCode',
                method: 'GET',
                controller: 'DefaultCronJobController',
                operation: 'stopJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/stop/:jobCode',
                    body: 'Specific job will be stoped'
                }
            },
            stopPostJob: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/job/stop',
                method: 'POST',
                controller: 'DefaultCronJobController',
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
                accessGroups: ['adminGroup'],
                key: '/job/remove/:jobCode',
                method: 'GET',
                controller: 'DefaultCronJobController',
                operation: 'removeJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/remove/:jobCode',
                    body: 'Specific job will be removed'
                }
            },
            removePostJob: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/job/remove',
                method: 'POST',
                controller: 'DefaultCronJobController',
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
                accessGroups: ['adminGroup'],
                key: '/job/pause/:jobCode',
                method: 'GET',
                controller: 'DefaultCronJobController',
                operation: 'pauseJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/pause/:jobCode',
                    body: 'Specific job will be paused'
                }
            },
            pausePostJob: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/job/pause',
                method: 'POST',
                controller: 'DefaultCronJobController',
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
                accessGroups: ['adminGroup'],
                key: '/job/resume/:jobCode',
                method: 'GET',
                controller: 'DefaultCronJobController',
                operation: 'resumeJob',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cronjob/job/resume/:jobCode',
                    body: 'Specific job will be resumed'
                }
            },
            resumePostJob: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/job/resume',
                method: 'POST',
                controller: 'DefaultCronJobController',
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