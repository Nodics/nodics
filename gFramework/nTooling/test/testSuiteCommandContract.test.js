/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/test/testSuiteCommandContract
 * @description Verifies package-script normalization through the configurable nTooling test suite command contract.
 * @layer test
 * @owner nTooling
 * @override Project tooling modules may add suite command scenarios without weakening configured-suite ownership.
 */
const assert = require('assert');
const path = require('path');

const testSuiteCommandService = require('../src/service/command/defaultTestSuiteCommandService');

assert.strictEqual(testSuiteCommandService.resolveSuiteName(['--suite=basic']), 'basic',
    'The suite command must accept explicit --suite=<name> arguments');
assert.strictEqual(testSuiteCommandService.resolveSuiteName(['workflow']), 'workflow',
    'The suite command must accept a positional suite name');
assert.strictEqual(testSuiteCommandService.resolveSuiteName(['--home=/tmp/project', '--suite=profile']), 'profile',
    'The suite command must ignore command context options while resolving suite names');

const configuredSuites = testSuiteCommandService.getSuites();
assert(Array.isArray(configuredSuites.basic), 'The basic suite must be configured in nTooling properties');
assert(configuredSuites.basic.some(step => step.suite === 'config'),
    'The basic suite must compose lower-level configured suites instead of duplicating long script chains');
assert(configuredSuites.full.some(step => step.suite === 'topology-modular'),
    'The full suite must keep modular topology validation in the suite registry');
assert(configuredSuites.tooling.some(step => step.node === 'gFramework/nTooling/test/testSuiteCommandContract.test.js'),
    'The tooling suite must guard the suite command contract');

const originalSpawn = testSuiteCommandService.spawn;
const spawned = [];
testSuiteCommandService.spawn = function (context, command, args) {
    spawned.push({
        cwd: context.home,
        command: command,
        args: args
    });
};

try {
    const context = {
        frameworkHome: path.resolve(__dirname, '../../..'),
        home: path.resolve(__dirname, '../../..')
    };
    testSuiteCommandService.runSuite(context, {
        composed: [
            { suite: 'leaf' },
            { npm: 'test:sample', args: ['--', '--fast'] },
            { node: 'gFramework/nTooling/test/sample.test.js', args: ['--dry-run'] },
            { tool: ['quality:docs'], args: ['--limit=1'] }
        ],
        leaf: [
            { npm: 'check:syntax' }
        ]
    }, 'composed', []);

    assert.deepStrictEqual(spawned[0].args, ['run', 'check:syntax'],
        'Nested suite steps must execute before following steps');
    assert.deepStrictEqual(spawned[1].args, ['run', 'test:sample', '--', '--fast'],
        'NPM suite steps must preserve configured arguments');
    assert.strictEqual(spawned[2].command, process.execPath,
        'Node suite steps must run through the current Node executable');
    assert(spawned[2].args[0].endsWith('gFramework/nTooling/test/sample.test.js'),
        'Node suite steps must resolve project-relative paths');
    assert.deepStrictEqual(spawned[3].args.slice(-2), ['quality:docs', '--limit=1'],
        'Tool suite steps must delegate to the governed Nodics tooling CLI');

    assert.throws(() => {
        testSuiteCommandService.runSuite(context, {
            loop: [{ suite: 'loop' }]
        }, 'loop', []);
    }, /Circular Nodics test suite reference/,
    'Circular suite references must fail with a clear governance error');

    assert.throws(() => {
        testSuiteCommandService.runStep(context, {}, { unknown: true }, []);
    }, /Invalid test suite step/,
    'Invalid suite steps must fail before spawning external commands');
} finally {
    testSuiteCommandService.spawn = originalSpawn;
}

console.log('nTooling test suite command contract validated');
