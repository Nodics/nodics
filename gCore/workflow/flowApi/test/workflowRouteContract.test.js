/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
