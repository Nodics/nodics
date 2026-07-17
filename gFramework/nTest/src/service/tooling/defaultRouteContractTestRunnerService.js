/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * @module nTest/service/tooling/defaultRouteContractTestRunnerService
 * @description Discovers and executes module-owned route contract tests throughout a target Nodics project.
 * @layer tooling
 * @owner nTest
 * @override Projects extend coverage by adding route contract tests or explicitly replacing this command.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());
const skippedDirectories = new Set(['.git', 'node_modules']);

/** Executes route contract tests when invoked as a tooling command. */
function runCli() {
    const tests = collectRouteContractTests(rootPath).sort();

    if (tests.length === 0) {
        console.log('No route contract tests found.');
        process.exit(0);
    }

    tests.forEach((testPath) => {
        const relativePath = path.relative(rootPath, testPath);
        console.log(`\nRunning ${relativePath}`);
        const result = spawnSync(process.execPath, [testPath], {
            cwd: rootPath,
            stdio: 'inherit'
        });

        if (result.status !== 0) {
            process.exit(result.status || 1);
        }
    });

    console.log(`\nRoute contract tests passed: ${tests.length}`);
}

function collectRouteContractTests(currentPath, tests = []) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    entries.forEach((entry) => {
        const entryPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
            if (!skippedDirectories.has(entry.name)) {
                collectRouteContractTests(entryPath, tests);
            }
            return;
        }

        const isRouteContractTest = entry.name.endsWith('RouteContract.test.js')
            && entryPath.split(path.sep).includes('test');
        if (isRouteContractTest) {
            tests.push(entryPath);
        }
    });

    return tests;
}

module.exports = {
    collectRouteContractTests: collectRouteContractTests,
    runCli: runCli
};

if (require.main === module) {
    runCli();
}
