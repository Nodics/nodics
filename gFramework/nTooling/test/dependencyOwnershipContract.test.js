/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/test/DependencyOwnershipContract
 * @description Verifies package dependency ownership so external providers,
 * runtime frameworks, and shared utilities remain declared by their owning
 * Nodics capability modules while the root package remains the install
 * aggregator for the repository.
 * @layer test
 * @owner nTooling
 * @override Projects may add project-owned dependencies, but must classify
 * ownership, declare owner module package metadata, and keep provider SDKs out
 * of unrelated modules.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../../..');
const rootPackage = require(path.join(repositoryRoot, 'package.json'));
const rootDependencies = rootPackage.dependencies || {};
const dependencyGovernance = rootPackage.nodics && rootPackage.nodics.dependencyGovernance;
const ownedDependencies = dependencyGovernance && dependencyGovernance.ownedDependencies;

function normalizePath(filePath) {
    return filePath.split(path.sep).join('/');
}

function walk(directory, files) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        if (['.git', 'node_modules', 'docs'].includes(entry.name)) return;
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            walk(entryPath, files);
        } else if (entry.name.endsWith('.js')) {
            files.push(entryPath);
        }
    });
}

function packageImports(filePath, packageName) {
    const source = fs.readFileSync(filePath, 'utf8');
    return source.includes('require("' + packageName) ||
        source.includes("require('" + packageName) ||
        source.includes('from "' + packageName) ||
        source.includes("from '" + packageName);
}

function assertOwnerPackageDeclares(packageName, ownerPath) {
    const packagePath = path.join(repositoryRoot, ownerPath, 'package.json');
    assert(fs.existsSync(packagePath), 'Dependency owner package is missing: ' + ownerPath);
    const ownerPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const declaredVersion = (ownerPackage.dependencies || {})[packageName] ||
        (ownerPackage.devDependencies || {})[packageName];
    assert.strictEqual(
        declaredVersion,
        rootDependencies[packageName],
        ownerPath + ' must declare dependency `' + packageName + '` with the root install version'
    );
}

assert(ownedDependencies, 'Root package.json must declare nodics.dependencyGovernance.ownedDependencies');

Object.keys(rootDependencies).forEach(packageName => {
    assert(ownedDependencies[packageName], 'Root dependency must declare owner metadata: ' + packageName);
    assert(Array.isArray(ownedDependencies[packageName].owners) && ownedDependencies[packageName].owners.length > 0,
        'Dependency must declare at least one owner module: ' + packageName);
    assert(ownedDependencies[packageName].type, 'Dependency must declare type: ' + packageName);
    assert(ownedDependencies[packageName].reason, 'Dependency must declare ownership reason: ' + packageName);
});

Object.keys(ownedDependencies).forEach(packageName => {
    assert(rootDependencies[packageName], 'Owned dependency is not installed by the root package: ' + packageName);
    ownedDependencies[packageName].owners.forEach(ownerPath => {
        assertOwnerPackageDeclares(packageName, ownerPath);
    });
});

const sourceFiles = [];
walk(repositoryRoot, sourceFiles);

Object.keys(rootDependencies).forEach(packageName => {
    const hits = sourceFiles.filter(filePath => packageImports(filePath, packageName));
    assert(hits.length > 0, 'Root dependency is declared but not imported by repository source: ' + packageName);
});

Object.keys(ownedDependencies).forEach(packageName => {
    const ownership = ownedDependencies[packageName];
    if (ownership.restricted !== true) return;

    const allowedRoots = [].concat(ownership.owners || [], ownership.allowedConsumers || []);
    const hits = sourceFiles.filter(filePath => packageImports(filePath, packageName));
    hits.forEach(filePath => {
        const relativePath = normalizePath(path.relative(repositoryRoot, filePath));
        assert(
            allowedRoots.some(ownerPath => relativePath === ownerPath || relativePath.startsWith(ownerPath + '/')),
            'Restricted dependency `' + packageName + '` is imported outside owner boundaries: ' + relativePath
        );
    });
});

console.log('Dependency ownership contract validated');
