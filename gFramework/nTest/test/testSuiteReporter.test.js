/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTest/test/testSuiteReporter
 * @description Verifies Nodics test-output metric parsing and structured report construction.
 * @layer test
 * @owner nTest
 * @override New test output formats should add parser scenarios while preserving existing report fields.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseOutput, createReport, parseArgs, resolveServerReportDir } = require('../src/tooling/runTestSuiteWithReport');

['temp', 'tmp'].forEach(directoryName => {
    assert.strictEqual(
        fs.existsSync(path.join(process.cwd(), directoryName)),
        false,
        'Repository root `' + directoryName + '` must not own generated test reports or runtime output'
    );
});

let serverReportDir = resolveServerReportDir('kickoffLocalServer');
assert.strictEqual(serverReportDir, path.join(
    process.cwd(),
    'kickoff/kickoffEnvs/kickoffLocal/kickoffLocalServer/generated/test-reports'
));
let parsedArgs = parseArgs(['--server=kickoffLocalServer', '--', 'npm', 'test']);
assert.strictEqual(parsedArgs.serverName, 'kickoffLocalServer');
assert.strictEqual(parsedArgs.reportDir, serverReportDir);
assert.throws(() => parseArgs([
    '--server=kickoffLocalServer',
    '--report-dir=temp/test-reports',
    '--',
    'npm',
    'test'
]), /must be written under the selected server module/);

// @nodics-capability-behavior @nodics-area testing
let output = [
    '> nodics@0.0.1 test:topology',
    '',
    'Running gCore/profile/test/profileRouteContract.test.js',
    'Route contract tests passed: 7',
    'Capability behavior tests passed for area profile: 3',
    'Generated tests passed: 149',
    'Runtime topology smoke passed',
    'Mode: all',
    'Consolidated: kickoffLocalServer:3000',
    'Consolidated communication: http://127.0.0.1:3000/nodics/profile/v0/ping?help -> 200',
    'Modular: kickoffLocalProfileServer:3000, kickoffLocalNemsServer:3020',
    'Communication: http://127.0.0.1:3020/nodics/nems/v0/ping?help -> 200'
].join('\n');

let parsed = parseOutput(output);
assert.strictEqual(parsed.summary.suiteCount, 1);
assert.strictEqual(parsed.summary.testCount, 162);
assert.strictEqual(parsed.summary.passedCount, 162);
assert(parsed.modules.includes('profile'));
assert(parsed.modules.includes('nems'));
assert(parsed.modules.includes('generated'));
assert.strictEqual(parsed.topology.mode, 'all');
assert.deepStrictEqual(parsed.topology.consolidated, ['kickoffLocalServer:3000']);
assert.deepStrictEqual(parsed.topology.modular, ['kickoffLocalProfileServer:3000', 'kickoffLocalNemsServer:3020']);
assert.strictEqual(parsed.topology.communication.length, 2);

let importParsed = parseOutput([
    '> nodics@0.0.1 test:import',
    '> nodics@0.0.1 test:import-validation',
    '> nodics@0.0.1 test:import-run-summary'
].join('\n'));

assert.strictEqual(importParsed.summary.suiteCount, 3);
assert.strictEqual(importParsed.summary.testCount, 3);
assert.strictEqual(importParsed.summary.passedCount, 3);
assert(importParsed.modules.includes('import'));

let importReport = createReport({
    suiteName: 'import',
    command: ['npm', 'run', 'test:import'],
    output: [
        '> nodics@0.0.1 test:import',
        '> nodics@0.0.1 test:import-validation',
        '> nodics@0.0.1 test:import-run-summary'
    ].join('\n'),
    exitCode: 0,
    startedAt: new Date('2026-06-16T00:00:00.000Z'),
    endedAt: new Date('2026-06-16T00:00:01.000Z'),
    env: {}
});

assert.deepStrictEqual(importReport.modules, ['import']);
assert(importReport.tests.every(test => test.moduleName === 'import'));

let report = createReport({
    suiteName: 'basic',
    command: ['npm', 'run', 'test:basic'],
    output: output,
    exitCode: 0,
    startedAt: new Date('2026-06-16T00:00:00.000Z'),
    endedAt: new Date('2026-06-16T00:00:05.000Z'),
    env: {
        SERVER: 'kickoffLocalServer',
        NODE: '/opt/homebrew/bin/node',
        NODICS_NODE: 'kickoffLocalNode0',
        NODICS_TEST_TENANT: 'nodicsTest'
    }
});

assert.strictEqual(report.status, 'PASSED');
assert.strictEqual(report.durationMs, 5000);
assert.strictEqual(report.environment.server, 'kickoffLocalServer');
assert.strictEqual(report.environment.node, 'kickoffLocalNode0');
assert.strictEqual(report.environment.tenant, 'nodicsTest');

console.log('Test suite reporter validated');
