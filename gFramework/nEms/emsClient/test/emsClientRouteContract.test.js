/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const { assertRouteContracts } = require('../../../nRouter/test/routerContractTestUtils');
const routerConfig = require('../src/router/router');

/**
 * @module gFramework/nEms/emsClient/test/emsClientRouteContract.test
 * @description Validates EMS client route metadata for publish, register, and close operations.
 * @layer test
 * @owner nEms
 * @override Project modules may add route contracts for custom EMS endpoints while preserving this base client route surface.
 */

const emsController = 'DefaultEmsClientController';
const expectedRoutes = [
    { key: '/publish', method: 'POST', controller: emsController, operation: 'publish', secured: true },
    { key: '/register/consumer/:consumer', method: 'GET', controller: emsController, operation: 'registerConsumers', secured: true },
    { key: '/register/consumers', method: 'POST', controller: emsController, operation: 'registerConsumers', secured: true },
    { key: '/register/publisher/:publisher', method: 'GET', controller: emsController, operation: 'registerPublishers', secured: true },
    { key: '/register/publishers', method: 'POST', controller: emsController, operation: 'registerPublishers', secured: true },
    { key: '/close/consumer/:consumer', method: 'GET', controller: emsController, operation: 'closeConsumers', secured: true },
    { key: '/close/consumers', method: 'POST', controller: emsController, operation: 'closeConsumers', secured: true },
    { key: '/close/publisher/:publisher', method: 'GET', controller: emsController, operation: 'closePublishers', secured: true },
    { key: '/close/publishers', method: 'POST', controller: emsController, operation: 'closePublishers', secured: true }
];

assertRouteContracts(routerConfig, expectedRoutes);
console.log(`EMS client route contract validated: ${expectedRoutes.length} routes`);
