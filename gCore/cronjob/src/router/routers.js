/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/router/routers
 * @description Secured cronjob route contracts for creating, updating, running, starting, stopping, removing, pausing, and resuming jobs.
 * @layer router
 * @owner cronjob
 * @override Project modules may add or override cronjob routes through later router fragments.
 */
module.exports = {
    cronjob: {
        createJob: {
            createPostJob: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/create',
                method: 'POST',
                controller: 'DefaultCronJobController',
                operation: 'createJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
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
            createPostJobByCode: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/create/:jobCode',
                method: 'POST',
                controller: 'DefaultCronJobController',
                operation: 'createJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/create/:jobCode',
                    body: 'Specific job will be created'
                }
            },
        },

        updateJob: {
            updatePatchJob: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/update',
                method: 'PATCH',
                controller: 'DefaultCronJobController',
                operation: 'updateJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'PATCH',
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
            updatePatchJobByCode: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/update/:jobCode',
                method: 'PATCH',
                controller: 'DefaultCronJobController',
                operation: 'updateJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'PATCH',
                    url: 'http://host:port/nodics/cronjob/job/update/:jobCode',
                    body: 'Specific job will be updated'
                }
            },
        },

        runJob: {
            runPostJobByCode: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/run/:jobCode',
                method: 'POST',
                controller: 'DefaultCronJobController',
                operation: 'runJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/run/:jobCode',
                    body: 'Specific job will be executed'
                }
            },
        },

        startJob: {
            startPostJobByCode: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/start/:jobCode',
                method: 'POST',
                controller: 'DefaultCronJobController',
                operation: 'startJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/start/:jobCode',
                    body: 'Specific job will be started'
                }
            },
            startPostJob: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/start',
                method: 'POST',
                controller: 'DefaultCronJobController',
                operation: 'startJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/start',
                    body: ['job1', 'job2', 'job3', 'job...n']
                }
            },
        },

        stopJob: {
            stopPostJobByCode: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/stop/:jobCode',
                method: 'POST',
                controller: 'DefaultCronJobController',
                operation: 'stopJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/stop/:jobCode',
                    body: 'Specific job will be stoped'
                }
            },
            stopPostJob: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/stop',
                method: 'POST',
                controller: 'DefaultCronJobController',
                operation: 'stopJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/stop',
                    body: ['job1', 'job2', 'job3', 'job...n']
                }
            },
        },

        removeJob: {
            removeDeleteJobByCode: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/remove/:jobCode',
                method: 'DELETE',
                controller: 'DefaultCronJobController',
                operation: 'removeJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/cronjob/job/remove/:jobCode',
                    body: 'Specific job will be removed'
                }
            },
            removeDeleteJob: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/remove',
                method: 'DELETE',
                controller: 'DefaultCronJobController',
                operation: 'removeJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/cronjob/job/remove',
                    body: ['job1', 'job2', 'job3', 'job...n']
                }
            },
        },

        pauseJob: {
            pausePostJobByCode: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/pause/:jobCode',
                method: 'POST',
                controller: 'DefaultCronJobController',
                operation: 'pauseJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/pause/:jobCode',
                    body: 'Specific job will be paused'
                }
            },
            pausePostJob: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/pause',
                method: 'POST',
                controller: 'DefaultCronJobController',
                operation: 'pauseJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/pause',
                    body: ['job1', 'job2', 'job3', 'job...n']
                }
            },
        },

        resumeJob: {
            resumePostJobByCode: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/resume/:jobCode',
                method: 'POST',
                controller: 'DefaultCronJobController',
                operation: 'resumeJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/resume/:jobCode',
                    body: 'Specific job will be resumed'
                }
            },
            resumePostJob: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/job/resume',
                method: 'POST',
                controller: 'DefaultCronJobController',
                operation: 'resumeJob',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/cronjob/job/resume',
                    body: ['job1', 'job2', 'job3', 'job...n']
                }
            }
        }
    }
};
