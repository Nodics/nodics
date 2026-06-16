const assert = require('assert');
const { parseOutput, createReport } = require('../run-test-suite-with-report');

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
