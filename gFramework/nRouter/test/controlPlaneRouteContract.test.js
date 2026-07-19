/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nRouter/test/controlPlaneRouteContract
 * @description Verifies sensitive control-plane route definitions declare
 * action-specific permissions instead of relying only on broad access groups.
 * @layer test
 * @owner nRouter
 * @override Project modules may add their own control-plane APIs, but each
 * sensitive route must declare an explicit permission or governed
 * permissionConfig.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { flattenRoutes } = require('./routerContractTestUtils');

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());
const ignoredDirectories = new Set(['.git', 'docs', 'generated', 'node_modules']);
const controlPlanePathPattern = /\/(config|class|import|export|test|log|schema\/indexes|schema\/validator|file\/data|file\/download|contract\/openapi|contract\/swagger|health\/ready)(\/|$)/i;
const expectedPermissions = {
    'GET /health/ready/details': 'system.health.readiness.view',
    'POST /file/data': 'system.file.read',
    'POST /file/download': 'system.file.download',
    'POST /import/init': 'import.init.run',
    'POST /import/core': 'import.core.run',
    'POST /import/sample': 'import.sample.run',
    'POST /import/local': 'import.local.run',
    'POST /log/level': 'system.log.level.update',
    'POST /schema/indexes/all': 'system.schema.index.rebuild',
    'POST /schema/indexes/schema/:schema': 'system.schema.index.rebuild',
    'POST /schema/indexes': 'system.schema.index.rebuild',
    'POST /schema/validator/schema/:schema': 'system.schema.validator.rebuild',
    'POST /schema/validator': 'system.schema.validator.rebuild',
    'POST /test/runUTest': 'system.test.unit.run',
    'POST /test/runNTest': 'system.test.nodics.run',
    'POST /export': 'export.run',
    'GET /contract/openapi': 'system.contract.openapi.view',
    'GET /contract/swagger': 'system.contract.swagger.view',
    'GET /contract/swagger/asset/:assetName': 'system.contract.swagger.view',
    'GET /class/get/:className': 'dynamo.class.view',
    'GET /class/snapshot/:type/:className': 'dynamo.class.snapshot.view',
    'PUT /class/update/:type/:className': 'dynamo.class.update',
    'POST /class/execute': 'dynamo.class.execute'
};
const expectedExposure = {
    'GET /health/ready': 'operationalHealth',
    'GET /health/ready/details': 'operationalHealth',
    'POST /file/data': 'fileAccess',
    'POST /file/download': 'fileAccess',
    'POST /import/init': 'dataImport',
    'POST /import/core': 'dataImport',
    'POST /import/sample': 'dataImport',
    'POST /import/local': 'dataImport',
    'POST /log/level': 'logManagement',
    'POST /schema/indexes/all': 'schemaMaintenance',
    'POST /schema/indexes/schema/:schema': 'schemaMaintenance',
    'POST /schema/indexes': 'schemaMaintenance',
    'POST /schema/validator/schema/:schema': 'schemaMaintenance',
    'POST /schema/validator': 'schemaMaintenance',
    'POST /test/runUTest': 'testExecution',
    'POST /test/runNTest': 'testExecution',
    'POST /export': 'dataExport',
    'GET /contract/openapi': 'openApiContract',
    'GET /contract/swagger': 'openApiContract',
    'GET /contract/swagger/asset/:assetName': 'openApiContract',
    'GET /class/get/:className': 'dynamicClass',
    'GET /class/snapshot/:type/:className': 'dynamicClass',
    'PUT /class/update/:type/:className': 'dynamicClass',
    'POST /class/execute': 'dynamicClass'
};

function collectRouterFiles(currentPath, files = []) {
    fs.readdirSync(currentPath, { withFileTypes: true }).forEach((entry) => {
        const entryPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
            if (!ignoredDirectories.has(entry.name)) {
                collectRouterFiles(entryPath, files);
            }
            return;
        }

        if ((entry.name === 'routers.js' || entry.name === 'router.js')
            && entryPath.split(path.sep).includes('src')
            && entryPath.split(path.sep).includes('router')) {
            files.push(entryPath);
        }
    });
    return files;
}

const violations = [];
collectRouterFiles(rootPath).forEach((filePath) => {
    delete require.cache[require.resolve(filePath)];
    flattenRoutes(require(filePath)).forEach((route) => {
        if (!controlPlanePathPattern.test(route.key || '')) {
            return;
        }
        let routeKey = String(route.method).toUpperCase() + ' ' + route.key;
        if (route.publicProbe === true) {
            if (route.apiExposure !== 'operationalHealth') {
                violations.push(`${path.relative(rootPath, filePath)}: ${routeKey} public probe requires operationalHealth exposure`);
            }
            return;
        }
        let expectedPermission = expectedPermissions[routeKey];
        if (expectedPermission && route.permission !== expectedPermission) {
            violations.push(`${path.relative(rootPath, filePath)}: ${routeKey} expected ${expectedPermission}, found ${route.permission || 'none'}`);
            return;
        }
        let expectedCategory = expectedExposure[routeKey];
        if (expectedCategory && route.apiExposure !== expectedCategory) {
            violations.push(`${path.relative(rootPath, filePath)}: ${routeKey} expected apiExposure ${expectedCategory}, found ${route.apiExposure || 'none'}`);
            return;
        }
        if (!route.permission && !route.permissionConfig) {
            violations.push(`${path.relative(rootPath, filePath)}: ${routeKey} requires permission or permissionConfig`);
            return;
        }
        if (!route.apiExposure) {
            violations.push(`${path.relative(rootPath, filePath)}: ${routeKey} requires apiExposure category`);
        }
    });
});

assert.deepStrictEqual(violations, [], `Control-plane route permission violations:\n${violations.join('\n')}`);
console.log('Control-plane route permissions validated');
