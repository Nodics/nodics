/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/config/tooling
 * @description Default non-runtime command contributions supplied by the Nodics framework tooling package.
 * @layer config
 * @owner nTooling
 * @override Later-index project modules may add commands or explicitly replace handlers with `$override.mode: 'replace'`.
 */
module.exports = {
    commands: {
        'docs:coverage': {
            description: 'Inspect source documentation coverage for the target Nodics project.',
            handler: 'src/command/documentationCoverageCommand.js'
        },
        'quality:docs': {
            description: 'Run governed documentation quality gates for the target Nodics project.',
            handler: 'src/command/documentationGatesCommand.js'
        },
        'quality:copyright': {
            description: 'Validate standard Nodics copyright headers for JavaScript source and generated artifacts.',
            handler: 'src/command/nodeScriptCommand.js',
            script: 'src/quality/checkCopyrightHeaders.js'
        },
        'llm:generate': {
            description: 'Generate module-owned LLM context for the target Nodics project.',
            handler: 'src/command/nodeScriptCommand.js',
            script: 'src/context/generateModuleLlmContext.js'
        },
        'llm:clean': {
            description: 'Remove generated module LLM context from the target Nodics project.',
            handler: 'src/command/nodeScriptCommand.js',
            script: 'src/context/cleanModuleLlmContext.js'
        },
        'llm:validate': {
            description: 'Validate generated module LLM context for the target Nodics project.',
            handler: 'src/command/nodeScriptCommand.js',
            script: 'test/moduleLlmContext.test.js'
        },
        'module:metadata': {
            description: 'Normalize canonical Nodics package metadata for the target project.',
            handler: 'src/command/nodeScriptCommand.js',
            script: 'src/context/normalizeModuleMetadata.js'
        },
        'module:metadata:validate': {
            description: 'Validate canonical Nodics package metadata for the target project.',
            handler: 'src/command/nodeScriptCommand.js',
            script: 'test/moduleMetadata.test.js'
        },
        'mcp:governance': {
            description: 'Print read-only Nodics governance context for future MCP adapters.',
            handler: 'src/command/mcpGovernanceCommand.js'
        },
        'debug:clean': {
            description: 'Run Nodics clean under the debugger and break on startup.',
            handler: 'src/command/nodeScriptCommand.js',
            script: 'src/debug/nodicsDebug.js',
            arguments: ['clean', '--brk']
        },
        'debug:clean:inspect': {
            description: 'Run Nodics clean under the debugger without an initial breakpoint.',
            handler: 'src/command/nodeScriptCommand.js',
            script: 'src/debug/nodicsDebug.js',
            arguments: ['clean', '--no-brk']
        },
        'debug:build': {
            description: 'Run Nodics build under the debugger and break on startup.',
            handler: 'src/command/nodeScriptCommand.js',
            script: 'src/debug/nodicsDebug.js',
            arguments: ['build', '--brk']
        },
        'debug:build:inspect': {
            description: 'Run Nodics build under the debugger without an initial breakpoint.',
            handler: 'src/command/nodeScriptCommand.js',
            script: 'src/debug/nodicsDebug.js',
            arguments: ['build', '--no-brk']
        },
        'debug:start': {
            description: 'Run Nodics startup under the debugger and break on startup.',
            handler: 'src/command/nodeScriptCommand.js',
            script: 'src/debug/nodicsDebug.js',
            arguments: ['start', '--brk']
        },
        'debug:start:inspect': {
            description: 'Run Nodics startup under the debugger without an initial breakpoint.',
            handler: 'src/command/nodeScriptCommand.js',
            script: 'src/debug/nodicsDebug.js',
            arguments: ['start', '--no-brk']
        }
    }
};
