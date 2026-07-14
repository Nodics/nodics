/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/service/mcp/defaultMcpValidationService
 * @description Runs approved Nodics validation checks for MCP clients and returns structured, sanitized results without letting MCP define quality gates.
 * @layer tooling
 * @owner nTooling
 * @override Projects may add transport wrappers around these checks, but the approved command catalog and result-shaping contract must remain explicit and reviewable.
 */
const { spawnSync } = require('child_process');

const approvedChecks = {
    'ai:validate': {
        command: ['npm', 'run', 'ai:validate'],
        description: 'Validate portable AI governance contracts.'
    },
    'llm:validate': {
        command: ['npm', 'run', 'llm:validate'],
        description: 'Validate generated module LLM context freshness.'
    },
    'quality:docs': {
        command: ['npm', 'run', 'quality:docs'],
        description: 'Run governed documentation quality gates.'
    },
    'test:tooling': {
        command: ['npm', 'run', 'test:tooling'],
        description: 'Run nTooling contract tests, including MCP governance contracts.'
    },
    'test:config': {
        command: ['npm', 'run', 'test:config'],
        description: 'Run configuration, metadata, tooling, layered test discovery, and LLM context checks.'
    },
    'ai:principle-audit': {
        command: ['npm', 'run', 'ai:principle-audit'],
        description: 'Run repeatable design-principle drift checks.'
    }
};

module.exports = {
    /**
     * Returns the approved MCP validation catalog.
     * @returns {Object<string,Object>} Approved checks.
     */
    getApprovedChecks: function () {
        return Object.keys(approvedChecks).sort().reduce((catalog, checkName) => {
            catalog[checkName] = {
                command: approvedChecks[checkName].command.join(' '),
                description: approvedChecks[checkName].description
            };
            return catalog;
        }, {});
    },

    /**
     * Normalizes check names or selects the default safe set.
     * @param {string[]} checks Requested check names.
     * @returns {string[]} Checks to run.
     */
    resolveChecks: function (checks) {
        const requested = checks && checks.length ? checks : ['ai:validate', 'llm:validate'];
        requested.forEach(checkName => {
            if (!approvedChecks[checkName]) {
                throw new Error('Unsupported MCP validation check: ' + checkName);
            }
        });
        return requested;
    },

    /**
     * Runs one approved validation check.
     * @param {string} home Repository home.
     * @param {string} checkName Approved check name.
     * @returns {Object} Structured result.
     */
    runCheck: function (home, checkName) {
        const startedAt = Date.now();
        const definition = approvedChecks[checkName];
        const result = spawnSync(definition.command[0], definition.command.slice(1), {
            cwd: home,
            encoding: 'utf8',
            env: Object.assign({}, process.env, { NODICS_HOME: home })
        });
        return {
            check: checkName,
            command: definition.command.join(' '),
            description: definition.description,
            status: result.status === 0 ? 'passed' : 'failed',
            exitCode: result.status,
            durationMs: Date.now() - startedAt,
            stdout: (result.stdout || '').trim().slice(-4000),
            stderr: (result.stderr || '').trim().slice(-4000),
            error: result.error && result.error.message
        };
    },

    /**
     * Runs approved validation checks and returns structured MCP-safe results.
     * @param {Object} options Validation options.
     * @returns {Object} Validation report.
     */
    runValidation: function (options = {}) {
        const home = options.home || process.cwd();
        const checks = this.resolveChecks(options.checks || []);
        const results = checks.map(checkName => this.runCheck(home, checkName));
        return {
            contract: 'Nodics MCP Phase 2 validation',
            approvedOnly: true,
            sourceOfTruth: 'Validation commands are Nodics package/tooling commands; MCP only invokes approved checks and reports structured results.',
            checks: results,
            summary: {
                requested: checks.length,
                passed: results.filter(result => result.status === 'passed').length,
                failed: results.filter(result => result.status === 'failed').length
            }
        };
    }
};
