/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/service/mcp/defaultMcpMutationGuardService
 * @description Produces guarded mutation and generation plans for MCP clients so module scaffolding, docs, generated artifacts, build, and clean actions remain explicit and contract-driven.
 * @layer tooling
 * @owner nTooling
 * @override Future mutation executors may consume these plans, but they must preserve explicit action classification, approval requirements, source-of-truth checks, and validation gates.
 */
const path = require('path');
const governanceService = require('./defaultMcpGovernanceService');

const actionCatalog = {
    'module-skeleton': {
        mutation: true,
        requiresApproval: true,
        description: 'Create a project, environment, server, node, or capability module skeleton from approved hierarchy metadata.',
        requiredInputs: ['moduleName', 'kind', 'parent', 'approvedHierarchy'],
        sourceOfTruth: ['gSetup/llm/module-generation-guide.md', 'gSetup/llm/contracts/module-structure-contract.md'],
        validation: ['npm run test:module-metadata', 'npm run test:tooling', 'npm run llm:validate']
    },
    'documentation-update': {
        mutation: true,
        requiresApproval: true,
        description: 'Update module-owned README, AGENTS, docs, contracts, or examples.',
        requiredInputs: ['targetPath', 'owningModule'],
        sourceOfTruth: ['nearest AGENTS.md', 'owning module README.md', 'gSetup/llm/contracts/documentation-impact-contract.md'],
        validation: ['npm run quality:docs', 'npm run llm:validate']
    },
    'generated-artifacts': {
        mutation: true,
        requiresApproval: true,
        description: 'Regenerate artifacts from source definitions, never edit generated output by hand.',
        requiredInputs: ['sourceDefinition', 'generatorCommand'],
        sourceOfTruth: ['schema/router/source definition', 'owning module generated context'],
        validation: ['npm run llm:validate', 'npm run quality:docs']
    },
    'safe-build': {
        mutation: true,
        requiresApproval: true,
        description: 'Run the approved build command after source definitions are ready.',
        requiredInputs: ['reason'],
        sourceOfTruth: ['package.json scripts', 'module-owned source definitions'],
        validation: ['npm run build']
    },
    'safe-clean': {
        mutation: true,
        requiresApproval: true,
        description: 'Run the approved clean command to remove generated output before regeneration.',
        requiredInputs: ['reason'],
        sourceOfTruth: ['package.json scripts', 'generated artifact ownership'],
        validation: ['npm run clean']
    }
};

module.exports = {
    /**
     * Returns the guarded action catalog.
     * @returns {Object<string,Object>} Action catalog.
     */
    getActionCatalog: function () {
        return actionCatalog;
    },

    /**
     * Creates a guarded mutation/generation plan.
     * @param {Object} options Plan options.
     * @returns {Object} Guarded action plan.
     */
    createPlan: function (options = {}) {
        const home = path.resolve(options.home || process.env.NODICS_HOME || process.cwd());
        const action = options.action || 'module-skeleton';
        const definition = actionCatalog[action];
        if (!definition) {
            throw new Error('Unsupported MCP mutation action: ' + action);
        }
        const targetPath = governanceService.resolveInsideHome(home, options.targetPath || '.');
        const modules = governanceService.discoverModules(home, home, []);
        const owner = governanceService.findOwningModule(modules, targetPath);
        const provided = options.inputs || {};
        const missingInputs = definition.requiredInputs.filter(inputName => !provided[inputName]);
        return {
            contract: 'Nodics MCP Phase 4 guarded mutation and generation',
            action: action,
            executableByDefault: false,
            requiresExplicitApproval: definition.requiresApproval,
            mutation: definition.mutation,
            description: definition.description,
            target: {
                path: governanceService.resolveInsideHome(home, options.targetPath || '.') && path.relative(home, targetPath).split(path.sep).join('/'),
                owningModule: owner && owner.name,
                owningModulePath: owner && owner.relativePath
            },
            requiredInputs: definition.requiredInputs,
            missingInputs: missingInputs,
            sourceOfTruth: definition.sourceOfTruth,
            validation: definition.validation,
            guardrails: [
                'Do not execute from MCP without explicit developer approval.',
                'Do not edit out-of-the-box framework code for customer behavior when a project module or override can own it.',
                'Do not hand-maintain generated artifacts as source of truth.',
                'Regenerate generated output from source definitions and validate afterward.',
                'Keep security, tenant, audit, diagnostics, rollback, and tests aligned.'
            ],
            ready: missingInputs.length === 0
        };
    }
};
