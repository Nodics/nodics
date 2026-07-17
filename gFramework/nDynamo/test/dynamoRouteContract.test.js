/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
