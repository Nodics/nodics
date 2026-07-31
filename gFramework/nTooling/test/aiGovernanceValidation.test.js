/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nTooling/test/aiGovernanceValidation
 * @description Verifies that repository-root AI governance and shared memory are owned by gSetup/llm while module-shaped packages retain local llm entrypoints.
 * @layer test
 * @owner nTooling
 * @override Project tooling may add stricter package guidance checks without introducing a repository-root llm authority.
 */

const assert = require('assert');

const {
    validateRootFiles,
    validatePackageFiles,
    validateAgentFiles
} = require('../src/service/quality/defaultAiGovernanceValidationService');

const rootFailures = [];
validateRootFiles(rootFailures);
assert.deepStrictEqual(rootFailures, [],
    'repository-root AI governance and shared memory must resolve through AGENTS.md and gSetup/llm');

const packageFailures = [];
validatePackageFiles(packageFailures);
assert(!packageFailures.some(failure => failure.includes('./llm/')),
    'the Nodics repository root must not require a parallel llm directory');
assert.deepStrictEqual(packageFailures, [],
    'module-shaped packages must retain their module-local AI/documentation entrypoints');

const agentFailures = [];
validateAgentFiles(agentFailures);
assert.deepStrictEqual(agentFailures, [],
    'AGENTS.md files must retain resolvable root and gSetup/llm guidance links');

console.log('AI governance validation contract validated');
