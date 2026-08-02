/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const { assertRouteContracts } = require('../../nRouter/test/routerContractTestUtils');
const routerConfig = require('../src/router/routers');

const classController = 'DefaultClassConfigurationController';
const expectedRoutes = [
    { key: '/class/get/:className', method: 'GET', controller: classController, operation: 'getClass', secured: true, permission: 'dynamo.class.view' },
    { key: '/class/snapshot/:type/:className', method: 'GET', controller: classController, operation: 'getSnapshot', secured: true, permission: 'dynamo.class.snapshot.view' },
    { key: '/class/update/:type/:className', method: 'PUT', controller: classController, operation: 'updateClass', secured: true, permission: 'dynamo.class.update' },
    { key: '/class/execute', method: 'POST', controller: classController, operation: 'executeClass', secured: true, permission: 'dynamo.class.execute' }
];

assertRouteContracts(routerConfig, expectedRoutes);
console.log(`Dynamo route contract validated: ${expectedRoutes.length} routes`);
