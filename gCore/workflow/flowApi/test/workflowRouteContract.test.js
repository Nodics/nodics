/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const { assertRouteContracts, flattenRoutes } = require('../../../../gFramework/nRouter/test/routerContractTestUtils');
const routerConfig = require('../src/router/routers');

const workflowController = 'DefaultWorkflowController';
const expectedRoutes = [
    { key: '/carrier/init', method: 'PUT', controller: workflowController, operation: 'initCarrier', secured: true },
    { key: '/carrier/release/:carrierCode', method: 'POST', controller: workflowController, operation: 'releaseCarrier', secured: true },
    { key: '/carrier/update', method: 'PUT', controller: workflowController, operation: 'updateCarrier', secured: true },
    { key: '/action/process/:carrierCode', method: 'POST', controller: workflowController, operation: 'performAction', secured: true }
];

assertRouteContracts(routerConfig, expectedRoutes);
const routes = flattenRoutes(routerConfig);
[
    '/carrier/block/:carrierCode',
    '/carrier/pause/:carrierCode',
    '/carrier/resume/:carrierCode',
    '/carrier/retry/:carrierCode',
    '/carrier/recover/:carrierCode',
    '/carrier/reset-error/:carrierCode'
].forEach((reservedRoute) => {
    assert(!routes.some((route) => route.key === reservedRoute), `${reservedRoute} must remain outside the public core workflow API until governed lifecycle contracts exist`);
});
console.log(`Workflow route contract validated: ${expectedRoutes.length} routes`);
