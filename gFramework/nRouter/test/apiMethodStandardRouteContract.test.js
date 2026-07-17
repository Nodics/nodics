/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { flattenRoutes } = require('./routerContractTestUtils');

/**
 * @module nRouter/test/apiMethodStandardRouteContract.test
 * @description Verifies repository router definitions keep GET routes read-only and keep help metadata aligned with runtime route methods.
 * @layer test
 * @owner nRouter
 * @override Project modules may add read-only GET routes, but command or mutation behavior must use POST, PATCH, PUT, or DELETE.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());
const ignoredDirectories = new Set(['.git', 'docs', 'generated', 'node_modules']);
const commandOperationPattern = /^(create|save|update|patch|delete|remove|run|start|stop|pause|resume|reset|process|publish|register|close|flush|change|activate|approve|reject|rollback|import|export|index|indexing|refresh|rebuild|validate|execute|apply|rotate|generate|logout)/i;
const commandPathPattern = /\/(create|save|update|patch|delete|remove|run|start|stop|pause|resume|reset|process|publish|register|close|flush|change|activate|approve|reject|rollback|import|export|index|indexing|refresh|rebuild|validate|execute|apply|rotate|generate|logout)(\/|$)/i;
const readOperationAllowList = new Set([
    'doExists',
    'doGet',
    'doGetSchema',
    'doSearch',
    'downloadFile',
    'get',
    'getClass',
    'getEnterprise',
    'getFileContent',
    'getImportRun',
    'getImportRunHistory',
    'getInternalAuthToken',
    'getOpenApiContract',
    'getRuntimeConfigurationActivationRequests',
    'getRuntimeConfigurationGovernanceSummary',
    'getRuntimeConfigurationHistory',
    'getSnapshot',
    'getTenants',
    'isCustomerExist',
    'loadCartByCode',
    'loadCartByRefCode',
    'loadCartByToken',
    'ping'
]);

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

function isCommandLikeGet(route) {
    if (String(route.method).toUpperCase() !== 'GET') {
        return false;
    }

    if (readOperationAllowList.has(route.operation)) {
        return false;
    }

    return commandOperationPattern.test(route.operation || '') || commandPathPattern.test(route.key || '');
}

const violations = [];
const routerFiles = collectRouterFiles(rootPath);
routerFiles.forEach((filePath) => {
    delete require.cache[require.resolve(filePath)];
    const routes = flattenRoutes(require(filePath));
    routes.forEach((route) => {
        const relativePath = path.relative(rootPath, filePath);
        if (isCommandLikeGet(route)) {
            violations.push(`${relativePath}: ${route.method} ${route.key} -> ${route.operation}`);
        }

        if (route.help && route.help.method && String(route.help.method).toUpperCase() !== String(route.method).toUpperCase()) {
            violations.push(`${relativePath}: help.method ${route.help.method} does not match ${route.method} for ${route.key} -> ${route.operation}`);
        }
    });
});

assert.deepStrictEqual(violations, [], `API method standard violations:\n${violations.join('\n')}`);
console.log(`API method standard validated across ${routerFiles.length} router files`);
