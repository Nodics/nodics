/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/test/ReleaseCheckCommandContract
 * @description Verifies the clean-checkout release gate is configured,
 * dry-runnable, and executable through governed nTooling command contracts.
 * @layer test
 * @owner nTooling
 * @override Project release gates may add stricter steps, but must preserve a
 * dry-run plan and explicit execution flag.
 */

const assert = require('assert');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../../..');
const packageJson = require(path.join(repositoryRoot, 'package.json'));
const toolingProperties = require('../config/properties');
const releaseCheck = require('../src/service/command/defaultReleaseCheckCommandService');
const command = toolingProperties.tooling.commands['release:check'];

assert(packageJson.scripts['release:check'], 'Root package.json must expose release:check');
assert.strictEqual(command.handler, 'src/service/command/defaultReleaseCheckCommandService.js');

const context = {
    home: repositoryRoot,
    args: [],
    command: command
};
const dryPlan = releaseCheck.createPlan(context);
assert.deepStrictEqual(dryPlan.map(step => releaseCheck.normalizeStep(step).label), [
    'npm ci',
    'npm run clean',
    'npm run build',
    'npm run llm:validate',
    'npm run quality:docs',
    'npm run test:basic'
]);

const fullPlan = releaseCheck.createPlan(Object.assign({}, context, {
    args: ['--full']
}));
assert.strictEqual(releaseCheck.normalizeStep(fullPlan[fullPlan.length - 1]).label, 'npm run test:full',
    'Full release validation must include test:full');

let printed = [];
const originalLog = console.log;
console.log = function (message) {
    printed.push(message);
};
try {
    releaseCheck.run(context);
} finally {
    console.log = originalLog;
}
assert(printed.some(line => String(line).includes('Nodics clean-checkout release gate')),
    'Dry run must print a release gate heading');
assert(printed.some(line => String(line).includes('Run with --execute')),
    'Dry run must explain explicit execution');

let executed = [];
const originalExecuteStep = releaseCheck.executeStep;
releaseCheck.executeStep = function (runContext, step) {
    executed.push(this.normalizeStep(step).label);
};
try {
    releaseCheck.run(Object.assign({}, context, {
        args: ['--execute']
    }));
} finally {
    releaseCheck.executeStep = originalExecuteStep;
}
assert.deepStrictEqual(executed, dryPlan.map(step => releaseCheck.normalizeStep(step).label),
    'Execution must run the configured gate in order');

console.log('Release check command contract validated');
