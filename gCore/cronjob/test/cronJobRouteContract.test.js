/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const { assertRouteContracts, flattenRoutes } = require('../../../gFramework/nRouter/test/routerContractTestUtils');
const routerConfig = require('../src/router/routers');

/**
 * @module gCore/cronjob/test/cronJobRouteContract.test
 * @description Validates cronjob route metadata for create, update, run, start, stop, remove, pause, and resume operations.
 * @layer test
 * @owner cronjob
 * @override Project modules may add route contracts for custom scheduler endpoints while preserving this base lifecycle route surface.
 */

const cronJobController = 'DefaultCronJobController';
const expectedRoutes = [
    { key: '/job/create', method: 'POST', controller: cronJobController, operation: 'createJob', secured: true },
    { key: '/job/create/:jobCode', method: 'POST', controller: cronJobController, operation: 'createJob', secured: true },
    { key: '/job/update', method: 'PATCH', controller: cronJobController, operation: 'updateJob', secured: true },
    { key: '/job/update/:jobCode', method: 'PATCH', controller: cronJobController, operation: 'updateJob', secured: true },
    { key: '/job/run/:jobCode', method: 'POST', controller: cronJobController, operation: 'runJob', secured: true },
    { key: '/job/start/:jobCode', method: 'POST', controller: cronJobController, operation: 'startJob', secured: true },
    { key: '/job/start', method: 'POST', controller: cronJobController, operation: 'startJob', secured: true },
    { key: '/job/stop/:jobCode', method: 'POST', controller: cronJobController, operation: 'stopJob', secured: true },
    { key: '/job/stop', method: 'POST', controller: cronJobController, operation: 'stopJob', secured: true },
    { key: '/job/remove/:jobCode', method: 'DELETE', controller: cronJobController, operation: 'removeJob', secured: true },
    { key: '/job/remove', method: 'DELETE', controller: cronJobController, operation: 'removeJob', secured: true },
    { key: '/job/pause/:jobCode', method: 'POST', controller: cronJobController, operation: 'pauseJob', secured: true },
    { key: '/job/pause', method: 'POST', controller: cronJobController, operation: 'pauseJob', secured: true },
    { key: '/job/resume/:jobCode', method: 'POST', controller: cronJobController, operation: 'resumeJob', secured: true },
    { key: '/job/resume', method: 'POST', controller: cronJobController, operation: 'resumeJob', secured: true }
];

assertRouteContracts(routerConfig, expectedRoutes);
flattenRoutes(routerConfig).forEach(route => {
    if (route.operation && route.operation !== 'getJob') {
        assert.notStrictEqual(route.method, 'GET', 'CronJob lifecycle mutation routes must not use GET');
    }
});
console.log(`CronJob route contract validated: ${expectedRoutes.length} routes`);
