/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/test/mcpReadOnlyGovernanceContract
 * @description Verifies the first MCP governance slice remains read-only and reports workspace, module, AGENTS, generated-context, and change-impact guidance from existing Nodics contracts.
 * @layer test
 * @owner nTooling
 * @override Future MCP transport tests may extend these assertions, but must not weaken read-only source-of-truth boundaries.
 */
const assert = require('assert');
const path = require('path');

const readOnlyGovernanceService = require('../src/mcp/readOnlyGovernanceService');
const toolingCommandService = require('../src/service/defaultToolingCommandService');

const repositoryRoot = path.resolve(__dirname, '../../..');
const report = readOnlyGovernanceService.createReport({
    home: repositoryRoot,
    path: 'gFramework/nTooling/src/mcp/readOnlyGovernanceService.js',
    changePaths: [
        'gFramework/nTooling/src/mcp/readOnlyGovernanceService.js',
        'gSetup/llm/module-generation-guide.md'
    ]
});

assert.strictEqual(report.readOnly, true, 'MCP governance report must be read-only');
assert(report.forbidden.some(rule => rule.includes('Do not persist architecture or configuration inside MCP')),
    'MCP report must reject hidden architecture/configuration authority');
assert(report.workspace.moduleCount > 0, 'Workspace summary must include discovered modules');
assert(report.workspace.sourceOfTruthContracts.includes('gSetup/llm/README.md'),
    'Workspace summary must reference existing LLM source-of-truth contracts');
assert(report.modules.some(moduleObject => moduleObject.name === 'nTooling'),
    'Module discovery must include nTooling');
assert.strictEqual(report.lookup.owningModule, 'nTooling',
    'Path lookup must resolve the nearest owning module');
assert(report.lookup.nearestAgents.some(agent => agent.path === 'gFramework/nTooling/AGENTS.md'),
    'Nearest AGENTS lookup must include the module guidance file');
assert.strictEqual(report.lookup.generatedContext.contextPath, 'gFramework/nTooling/llm/generated/module-context.md',
    'Generated module context lookup must point at the owning module context');
assert(report.changeImpact[0].artifactTypes.includes('source or support file') ||
    report.changeImpact[0].artifactTypes.includes('service behavior'),
'Change-impact guidance must classify source paths');
assert(report.changeImpact[1].artifactTypes.includes('documentation and AI guidance'),
    'Change-impact guidance must classify LLM documentation paths');
assert.throws(() => {
    readOnlyGovernanceService.createReport({
        home: repositoryRoot,
        path: '../outside'
    });
}, /must stay inside the selected Nodics home/,
'MCP governance lookup must not read outside the selected home');

const registry = toolingCommandService.loadCommands(repositoryRoot);
assert.strictEqual(registry['mcp:governance'].sourceModule, 'nTooling',
    'nTooling must own the default read-only MCP governance command');
assert.strictEqual(registry['mcp:governance'].handler, 'src/command/mcpGovernanceCommand.js',
    'MCP governance command must use the read-only command adapter');

console.log('MCP read-only governance contract validated');
