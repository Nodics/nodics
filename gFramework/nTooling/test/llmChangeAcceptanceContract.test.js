/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/test/llmChangeAcceptanceContract
 * @description Prevents the mandatory Nodics hierarchy, customization, and test-coverage contract from disappearing from canonical LLM guidance.
 * @layer test
 * @owner nTooling
 * @override Additional mandatory LLM contract clauses may extend these assertions without weakening the hierarchy and customization guarantees.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../../..');

function read(relativePath) {
    return fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

function requireClauses(relativePath, clauses) {
    const content = read(relativePath);
    clauses.forEach(clause => {
        assert(content.includes(clause), relativePath + ' must preserve LLM contract clause: ' + clause);
    });
}

requireClauses('gSetup/llm/nodics-principles.md', [
    '## Change Acceptance Contract',
    'every modification and every new source file',
    'Every new source file must include file-level documentation',
    'later-loaded customer project module',
    'without modifying out-of-the-box Nodics code',
    'override/customization test',
    'customization path is absent, undocumented, or untested'
]);

requireClauses('gSetup/llm/prompts/base-nodics-assistant-prompt.md', [
    'application-developer mode',
    'Nodics framework source as',
    'immutable and already qualified',
    'unless the developer explicitly requests it',
    'Change Acceptance Contract',
    'Human Maintainability Contract',
    'Nodics Expert LLM Decision Contract',
    'Every new source file must include file-level documentation',
    'every new or changed extension point',
    'override/customization test',
    'A change is not complete'
]);

requireClauses('gSetup/llm/contracts/human-maintainability-contract.md', [
    '# Human Maintainability Contract',
    'understandable, diagnosable, safely changeable, and',
    'reviewable by developers who did not create it',
    'AI-generated code has no special exemption'
]);

requireClauses('gSetup/llm/contracts/nodics-expert-decision-contract.md', [
    '# Nodics Expert LLM Decision Contract',
    'classify the change',
    'correct Nodics layer',
    'artifact should own the behavior',
    'Expected AI Output Before Coding'
]);

requireClauses('gSetup/llm/prompts/enterprise-architecture-quality-prompt.md', [
    'Mandatory acceptance rule',
    'Change Acceptance Contract',
    'Every new or changed extension point requires an override/customization test',
    'Reject the change as incomplete'
]);

requireClauses('gSetup/llm/prompts/README.md', [
    '# Nodics Workflow Prompts',
    'review-prompt.md',
    'refactor-prompt.md',
    'testing-prompt.md',
    'schema-change-prompt.md',
    'runtime-governance-prompt.md'
]);

requireClauses('gSetup/llm/prompts/review-prompt.md', [
    '# Nodics Review Prompt',
    'Prioritize findings before summaries',
    'violated contract or expected behavior',
    'customization paths',
    'generated files are regenerated from source definitions'
]);

requireClauses('gSetup/llm/prompts/refactor-prompt.md', [
    '# Nodics Refactor Prompt',
    'without changing platform capability',
    'do not create a second loader',
    'source-of-truth artifact',
    'override/customization proof'
]);

requireClauses('gSetup/llm/prompts/testing-prompt.md', [
    '# Nodics Testing Prompt',
    'distributed runtime',
    'later-loaded project modules can override behavior',
    'deterministic contract tests',
    'separate live'
]);

requireClauses('gSetup/llm/prompts/schema-change-prompt.md', [
    '# Nodics Schema Change Prompt',
    'source schema definitions are authoritative',
    'generated artifacts are outputs',
    'later-loaded modules may extend or override',
    'preview, approval, activation'
]);

requireClauses('gSetup/llm/prompts/runtime-governance-prompt.md', [
    '# Nodics Runtime Governance Prompt',
    'preview before mutation',
    'activation through the owning service',
    'rollback through the owning service',
    'Do not add a parallel activation channel'
]);

requireClauses('gSetup/llm/feature-process.md', [
    'override/customization behavior for every new or changed extension point',
    '## 9. Definition Of Done',
    'later-loaded override/customization path is documented and tested'
]);

requireClauses('gSetup/llm/testing-playbook.md', [
    'Every new or changed extension point requires an override/customization test',
    'change-acceptance requirement'
]);

requireClauses('gSetup/llm/artifact-definition-and-change-guide.md', [
    '## Configuration Properties',
    '## Schemas',
    '## Routers',
    '## Services',
    '## Functionality Change-Impact Matrix',
    'mandatory, conditional, generated, runtime-merged, and unaffected',
    'later-layer customization works without core edits'
]);

requireClauses('gSetup/llm/daily-change-checklist.md', [
    '# Daily Change Checklist',
    'application-developer mode',
    'only project-owned modules and effective project behavior',
    'explicitly requests framework inspection',
    '**Owner:**',
    '**Reuse:**',
    '**Override:**',
    '**Impact:**',
    '**Proof:**',
    'classify the artifact owner before coding',
    'understandable, diagnosable, safely changeable, and reviewable',
    'Evidence may be reused while the relevant files remain unchanged'
]);

requireClauses('gSetup/llm/change-gate-contract.md', [
    '## Verification Scope Contract',
    'Gate scope follows code ownership, not repository availability',
    'immutable, previously qualified dependency',
    'Never expand verification to the entire Nodics repository',
    '## Gate 1: Change Slice',
    '## Gate 2: Commit',
    '## Gate 3: Merge Or Release',
    '## Gate 4: Periodic Platform Audit',
    '## Proportional Verification',
    '## Token And Execution Efficiency',
    'may not silently select a weaker category'
]);

requireClauses('gSetup/llm/module-generation-guide.md', [
    '# Module Generation Guide',
    'Do not revive or copy `nCommon/templates`',
    'Runtime kind comes from `package.json.nodics.kind`',
    '`activeModules` decides what runs in the current process',
    'Do not copy a whole framework service, router, schema, or module',
    'regenerate module LLM context'
]);

requireClauses('gSetup/llm/contracts/integration-governance-contract.md', [
    '# Integration Governance Contract',
    'Capability Owner Rule',
    'Provider Selection Rule',
    'Connection And Secret Configuration',
    'Abstraction Boundary Rule',
    'Tenant, Environment, Server, And Node Overrides',
    'MCP Exposure Boundary',
    'hidden source of architecture'
]);

requireClauses('gSetup/llm/contracts/developer-implementation-contract.md', [
    'Apply `integration-governance-contract.md`'
]);

requireClauses('gSetup/llm/README.md', [
    '**Framework-maintainer mode:**',
    '**Application-developer mode:**',
    'framework-wide quality gates',
    'project-owned modules and their effective configuration',
    'when the developer explicitly requests it',
    'prompts/review-prompt.md',
    'prompts/refactor-prompt.md',
    'prompts/testing-prompt.md',
    'prompts/schema-change-prompt.md',
    'prompts/runtime-governance-prompt.md',
    'module-generation-guide.md',
    'contracts/integration-governance-contract.md'
]);

console.log('Nodics LLM change acceptance contract validated');
