/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');

/**
 * @module nTooling/service/quality/defaultDesignPrincipleAuditService
 * @description Runs a repeatable static audit over Nodics principle, governance,
 * LLM, command, generated-context, and report-location contracts so periodic
 * platform reviews can detect drift before broader manual or test-suite review.
 * @layer tooling
 * @owner nTooling
 * @override Project modules may add stricter principle-audit scripts, but must
 * preserve the core framework principle checks and avoid making generated
 * reports or temporary folders a source of truth.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());

/**
 * Reads a UTF-8 file relative to the repository root.
 *
 * @param {string} relativePath Repository-relative file path.
 * @returns {string} File content.
 */
function read(relativePath) {
    return fs.readFileSync(path.join(rootPath, relativePath), 'utf8');
}

/**
 * Records an audit failure.
 *
 * @param {string[]} failures Mutable failure list.
 * @param {string} message Failure message.
 * @returns {void}
 */
function fail(failures, message) {
    failures.push(message);
}

/**
 * Requires a file to contain all supplied clauses.
 *
 * @param {string[]} failures Mutable failure list.
 * @param {string} relativePath Repository-relative file path.
 * @param {string[]} clauses Required clauses.
 * @returns {void}
 */
function requireClauses(failures, relativePath, clauses) {
    let content = '';
    try {
        content = read(relativePath);
    } catch (error) {
        fail(failures, 'Missing principle audit file: ' + relativePath);
        return;
    }
    clauses.forEach(clause => {
        if (!content.includes(clause)) {
            fail(failures, relativePath + ' is missing principle audit clause: ' + clause);
        }
    });
}

/**
 * Parses package.json scripts.
 *
 * @param {string[]} failures Mutable failure list.
 * @returns {Object} Script map.
 */
function readScripts(failures) {
    try {
        return JSON.parse(read('package.json')).scripts || {};
    } catch (error) {
        fail(failures, 'package.json must be readable JSON: ' + error.message);
        return {};
    }
}

/**
 * Parses nTooling properties.
 *
 * @param {string[]} failures Mutable failure list.
 * @returns {Object} Tooling configuration.
 */
function readToolingProperties(failures) {
    try {
        return require(path.join(rootPath, 'gFramework', 'nTooling', 'config', 'properties.js')).tooling || {};
    } catch (error) {
        fail(failures, 'nTooling properties must be readable: ' + error.message);
        return {};
    }
}

/**
 * Validates that required command gates remain available.
 *
 * @param {string[]} failures Mutable failure list.
 * @returns {void}
 */
function auditCommandGates(failures) {
    const scripts = readScripts(failures);
    const tooling = readToolingProperties(failures);
    [
        'ai:validate',
        'ai:principle-audit',
        'llm:validate',
        'quality:docs',
        'quality:copyright',
        'test:basic',
        'test:full',
        'test:topology:consolidated',
        'test:topology:modular',
        'governance:report',
        'build'
    ].forEach(scriptName => {
        if (!scripts[scriptName]) {
            fail(failures, 'Missing principle audit command gate: ' + scriptName);
        }
    });
    if (scripts.build && !scripts.build.includes('nodics-tool.js build')) {
        fail(failures, 'build must delegate to the governed nTooling lifecycle command');
    }
    const buildSteps = (((tooling.commands || {}).build || {}).steps || []);
    const includesGovernanceReport = buildSteps.some(step => (step.tool || []).includes('governance:report'));
    if (!includesGovernanceReport) {
        fail(failures, 'nTooling build lifecycle must keep governance:report in the generated-artifact gate');
    }
}

/**
 * Validates source-of-truth principle and contract files.
 *
 * @param {string[]} failures Mutable failure list.
 * @returns {void}
 */
function auditPrincipleContracts(failures) {
    requireClauses(failures, 'gSetup/llm/contracts/nodics-principles.md', [
        'capabilities are sacred, implementations are negotiable',
        'provide default capabilities',
        'Security, access control, validation, audit, rollback, diagnostics, and test'
    ]);
    requireClauses(failures, 'gSetup/llm/nodics-principles.md', [
        'Capabilities are sacred; implementations are negotiable',
        '## Change Acceptance Contract',
        'runtime configuration, audit, rollback, validation, and access-control governance'
    ]);
    requireClauses(failures, 'gSetup/llm/change-gate-contract.md', [
        '## Gate 4: Periodic Platform Audit',
        'module structure and naming standards',
        'duplicate or parallel runtime mechanisms',
        'runtime activation, audit, rollback, and diagnostics',
        'Do not use repository `temp` or the refactor-only',
        'active server/node generated-report location'
    ]);
    requireClauses(failures, 'gSetup/llm/contracts/developer-implementation-contract.md', [
        'security, access, validation, audit, rollback, diagnostics, and test',
        'Apply `integration-governance-contract.md`'
    ]);
    requireClauses(failures, 'gSetup/llm/contracts/human-maintainability-contract.md', [
        'understandable, diagnosable, safely changeable, and',
        'AI-generated code has no special exemption'
    ]);
}

/**
 * Validates LLM guidance that keeps AI and human developers on the same rules.
 *
 * @param {string[]} failures Mutable failure list.
 * @returns {void}
 */
function auditLlmGuidance(failures) {
    requireClauses(failures, 'gSetup/llm/README.md', [
        'Framework-maintainer mode',
        'Application-developer mode',
        'prompts/runtime-governance-prompt.md',
        'contracts/integration-governance-contract.md'
    ]);
    requireClauses(failures, 'gSetup/llm/prompts/runtime-governance-prompt.md', [
        'preview before mutation',
        'rollback through the owning service',
        'Do not add a parallel activation channel'
    ]);
    requireClauses(failures, 'gSetup/llm/prompts/refactor-prompt.md', [
        'without changing platform capability',
        'do not create a second loader'
    ]);
    requireClauses(failures, 'gSetup/llm/prompts/testing-prompt.md', [
        'later-loaded project modules can override behavior',
        'separate live'
    ]);
}

/**
 * Validates generated module-context entrypoints and manifest availability.
 *
 * @param {string[]} failures Mutable failure list.
 * @returns {void}
 */
function auditGeneratedContextEntrypoints(failures) {
    [
        'gFramework/nConfig',
        'gFramework/nCommon',
        'gFramework/nTooling',
        'gFramework/nDynamo',
        'gFramework/nData/nImport/import',
        'gCore/profile'
    ].forEach(modulePath => {
        [
            'llm/generated/manifest.json',
            'llm/generated/module-context.md'
        ].forEach(relativeFile => {
            const fullPath = path.join(rootPath, modulePath, relativeFile);
            if (!fs.existsSync(fullPath)) {
                fail(failures, 'Missing generated context entrypoint: ' + modulePath + '/' + relativeFile);
            }
        });
    });
}

/**
 * Runs the design-principle audit.
 *
 * @returns {string[]} Validation failures.
 */
function audit() {
    const failures = [];
    auditCommandGates(failures);
    auditPrincipleContracts(failures);
    auditLlmGuidance(failures);
    auditGeneratedContextEntrypoints(failures);
    return failures;
}

/**
 * Executes the audit from the command line.
 *
 * @returns {void}
 */
function run() {
    const failures = audit();
    if (failures.length > 0) {
        console.error('Nodics design-principle audit failed:');
        failures.forEach(failure => console.error('- ' + failure));
        process.exit(1);
    }
    console.log('Nodics design-principle audit validated');
}

if (require.main === module) {
    run();
}

module.exports = {
    audit,
    auditCommandGates,
    auditPrincipleContracts,
    auditLlmGuidance,
    auditGeneratedContextEntrypoints,
    run
};
