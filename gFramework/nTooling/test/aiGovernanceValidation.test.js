/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
