/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nTooling/test/designPrincipleAiGovernanceContract
 * @description Ensures the design-principle audit cannot pass while canonical AI governance is invalid.
 * @layer test
 * @owner nTooling
 * @override Projects may add stricter principle checks while preserving canonical AI-governance validation.
 */

const assert = require('assert');

const {
    auditAiGovernance
} = require('../src/service/quality/defaultDesignPrincipleAuditService');

const calls = [];
const failures = [];
auditAiGovernance(failures, {
    validateRootFiles(target) {
        calls.push('root');
        target.push('root governance failure');
    },
    validatePackageFiles(target) {
        calls.push('packages');
        target.push('package governance failure');
    },
    validateReadmeCasing(target) {
        calls.push('readme-casing');
        target.push('README casing failure');
    },
    validateAgentFiles(target) {
        calls.push('agents');
        target.push('AGENTS inheritance failure');
    }
});

assert.deepStrictEqual(calls, ['root', 'packages', 'readme-casing', 'agents'],
    'principle audit must execute every canonical AI-governance validator');
assert.deepStrictEqual(failures, [
    'root governance failure',
    'package governance failure',
    'README casing failure',
    'AGENTS inheritance failure'
], 'principle audit must preserve AI-governance failures');

console.log('Design-principle AI-governance contract validated');
