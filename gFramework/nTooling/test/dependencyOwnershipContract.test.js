/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/test/DependencyOwnershipContract
 * @description Verifies package dependency ownership so external providers,
 * runtime frameworks, and shared utilities remain installed only by the root
 * package while root dependency governance records the owning Nodics modules.
 * @layer test
 * @owner nTooling
 * @override Projects may add project-owned dependencies only at the root, but
 * must classify ownership and keep provider SDKs out of unrelated modules.
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

function walkPackageFiles(directory, files) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        if (['.git', 'node_modules', 'docs'].includes(entry.name)) return;
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            walkPackageFiles(entryPath, files);
        } else if (entry.name === 'package.json') {
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

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function collectPackageFiles() {
    let files = [];
    walkPackageFiles(repositoryRoot, files);
    return files;
}

function assertOwnerPackageExists(ownerPath) {
    const packagePath = path.join(repositoryRoot, ownerPath, 'package.json');
    assert(fs.existsSync(packagePath), 'Dependency owner package is missing: ' + ownerPath);
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
        assertOwnerPackageExists(ownerPath);
    });
});

collectPackageFiles().filter(packagePath => packagePath !== path.join(repositoryRoot, 'package.json')).forEach(packagePath => {
    const modulePackage = readJson(packagePath);
    assert.deepStrictEqual(modulePackage.dependencies || {}, {},
        'Module package.json must not declare dependencies; root package.json is the only install authority: ' +
        normalizePath(path.relative(repositoryRoot, packagePath)));
    assert.deepStrictEqual(modulePackage.devDependencies || {}, {},
        'Module package.json must not declare devDependencies; root package.json is the only install authority: ' +
        normalizePath(path.relative(repositoryRoot, packagePath)));
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
