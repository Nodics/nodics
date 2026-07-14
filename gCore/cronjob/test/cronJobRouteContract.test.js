/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const { assertRouteContracts } = require('../../../gFramework/nRouter/test/routerContractTestUtils');
const routerConfig = require('../src/router/router');

/**
 * @module gCore/cronjob/test/cronJobRouteContract.test
 * @description Validates cronjob route metadata for create, update, run, start, stop, remove, pause, and resume operations.
 * @layer test
 * @owner cronjob
 * @override Project modules may add route contracts for custom scheduler endpoints while preserving this base lifecycle route surface.
 */

const cronJobController = 'DefaultCronJobController';
const expectedRoutes = [
    { key: '/job/create', method: 'GET', controller: cronJobController, operation: 'createJob', secured: true },
    { key: '/job/create', method: 'POST', controller: cronJobController, operation: 'createJob', secured: true },
    { key: '/job/create/:jobCode', method: 'GET', controller: cronJobController, operation: 'createJob', secured: true },
    { key: '/job/update', method: 'GET', controller: cronJobController, operation: 'updateJob', secured: true },
    { key: '/job/update', method: 'POST', controller: cronJobController, operation: 'updateJob', secured: true },
    { key: '/job/update/:jobCode', method: 'GET', controller: cronJobController, operation: 'updateJob', secured: true },
    { key: '/job/run/:jobCode', method: 'GET', controller: cronJobController, operation: 'runJob', secured: true },
    { key: '/job/start/:jobCode', method: 'GET', controller: cronJobController, operation: 'startJob', secured: true },
    { key: '/job/start', method: 'POST', controller: cronJobController, operation: 'startJob', secured: true },
    { key: '/job/stop/:jobCode', method: 'GET', controller: cronJobController, operation: 'stopJob', secured: true },
    { key: '/job/stop', method: 'POST', controller: cronJobController, operation: 'stopJob', secured: true },
    { key: '/job/remove/:jobCode', method: 'GET', controller: cronJobController, operation: 'removeJob', secured: true },
    { key: '/job/remove', method: 'POST', controller: cronJobController, operation: 'removeJob', secured: true },
    { key: '/job/pause/:jobCode', method: 'GET', controller: cronJobController, operation: 'pauseJob', secured: true },
    { key: '/job/pause', method: 'POST', controller: cronJobController, operation: 'pauseJob', secured: true },
    { key: '/job/resume/:jobCode', method: 'GET', controller: cronJobController, operation: 'resumeJob', secured: true },
    { key: '/job/resume', method: 'POST', controller: cronJobController, operation: 'resumeJob', secured: true }
];

assertRouteContracts(routerConfig, expectedRoutes);
console.log(`CronJob route contract validated: ${expectedRoutes.length} routes`);
