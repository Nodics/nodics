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

requireClauses('gSetup/llm/README.md', [
    '**Framework-maintainer mode:**',
    '**Application-developer mode:**',
    'framework-wide quality gates',
    'project-owned modules and their effective configuration',
    'when the developer explicitly requests it'
]);

console.log('Nodics LLM change acceptance contract validated');
