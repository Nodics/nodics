/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/test/projectPostmanCoverageOwnership
 * @description Enforces that reference Postman coverage for domain and project APIs remains owned by the active module that defines the capability.
 * @layer test
 * @owner nTooling
 * @override New project-specific API groups may extend the ownership matrix, but must point to concrete module-owned tests or remain pending until the owning module exists.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootPath = path.resolve(__dirname, '../../..');

const ownedReferenceCoverage = [{
    name: 'CMS page APIs',
    moduleName: 'cms',
    modulePath: path.join(rootPath, 'gContent', 'cms'),
    expectedKind: 'capability',
    generatedTests: [
        'test/gen/api/cmsPageApiContract.test.js',
        'test/gen/apiScenario/cmsPageApiScenario.test.js',
        'test/gen/crud/cmsPageCrudScenario.test.js',
        'test/gen/schema/cmsPageSchemaContract.test.js'
    ]
}, {
    name: 'CRES review APIs',
    moduleName: 'cres',
    modulePath: path.join(rootPath, 'gMrkty', 'cres'),
    expectedKind: 'capability',
    generatedTests: [
        'test/gen/api/reviewTestApiContract.test.js',
        'test/gen/apiScenario/reviewTestApiScenario.test.js',
        'test/gen/crud/reviewTestCrudScenario.test.js',
        'test/gen/schema/reviewTestSchemaContract.test.js'
    ]
}];

ownedReferenceCoverage.forEach(item => {
    const packagePath = path.join(item.modulePath, 'package.json');
    assert(fs.existsSync(packagePath), item.name + ' must be owned by a concrete module');

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    assert.strictEqual(packageJson.name, item.moduleName, item.name + ' module name must match runtime ownership');
    assert.strictEqual(packageJson.nodics.kind, item.expectedKind, item.name + ' must remain a module capability, not a central test fixture');
    assert.strictEqual(packageJson.nodics.runtimeModule, true, item.name + ' must stay runtime-loadable when active');
    assert(packageJson.nodics.owns.includes('test'), item.name + ' owning module must own its test surface');

    item.generatedTests.forEach(relativePath => {
        assert(fs.existsSync(path.join(item.modulePath, relativePath)),
            item.name + ' coverage must stay under owning module test inventory: ' + relativePath);
    });
});

const inactiveReferenceModules = ['daasCore', 'daasAPI'];
inactiveReferenceModules.forEach(moduleName => {
    const matches = [];
    walk(rootPath, filePath => {
        if (path.basename(filePath) !== 'package.json') return;
        if (filePath.includes(path.sep + 'node_modules' + path.sep)) return;
        if (filePath.includes(path.sep + '.git' + path.sep)) return;
        const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (packageJson.name === moduleName) matches.push(filePath);
    });
    assert.deepStrictEqual(matches, [],
        moduleName + ' reference coverage must remain pending until an owning module exists');
});

function walk(directory, visitor) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git') return;
            walk(fullPath, visitor);
        } else {
            visitor(fullPath);
        }
    });
}

console.log('Project Postman coverage ownership validated');
