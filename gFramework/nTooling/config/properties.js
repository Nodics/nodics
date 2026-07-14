/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/config/properties
 * @description Default non-runtime tooling properties for repository discovery, command scanning, and project-home inspection.
 * @layer config
 * @owner nTooling
 * @override Project tooling modules may override these properties through their own `config/properties.js` or by replacing the relevant nTooling service method through standard service merging.
 */
module.exports = {
    tooling: {
        discovery: {
            ignoreDotDirectories: true,
            ignoredDirectories: [
                '.git',
                '.idea',
                '.vscode',
                'node_modules',
                'logs',
                'temp',
                'tmp',
                'dist',
                'generated',
                'docs'
            ]
        },
        documentationGovernance: {
            description: 'Documentation gates owned by non-runtime Nodics quality tooling. Add a gate only after that module/layer is fully documented.',
            enforcedGates: [
                {
                    name: 'nRouter complete routing contract',
                    scope: 'all',
                    module: 'nRouter',
                    includeTests: true,
                    description: 'All nRouter module lifecycle, configuration, route metadata, router utilities, services, and contract tests must remain fully documented.'
                },
                {
                    name: 'nConfig complete startup and generation contract',
                    scope: 'all',
                    module: 'nConfig',
                    includeTests: true,
                    description: 'All nConfig runtime registries, configuration scripts, startup services, utilities, clean/build entrypoints, and governance tests must remain fully documented.'
                },
                {
                    name: 'nCommon complete shared platform contract',
                    scope: 'all',
                    module: 'nCommon',
                    includeTests: true,
                    description: 'All nCommon configuration, lifecycle, error, interceptor, processor, promise, file, security utility, access inheritance, event, status, and traceability contracts must remain fully documented.'
                },
                {
                    name: 'nTooling complete non-runtime command contract',
                    scope: 'all',
                    module: 'nTooling',
                    includeTests: true,
                    description: 'All nTooling command discovery, override governance, quality, context generation, metadata, adapters, and tests must remain fully documented.'
                },
                {
                    name: 'nTest complete test execution contract',
                    scope: 'all',
                    module: 'nTest',
                    includeTests: true,
                    description: 'All nTest module lifecycle, configuration, test execution, schema test generation, router, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'nDatabase runtime contract',
                    scope: 'runtime',
                    module: 'nDatabase',
                    description: 'nDatabase schema, connection, model, MongoDB adapter, generated CRUD, router, pipeline, controller, facade, and database wrapper contracts must remain fully documented.'
                },
                {
                    name: 'nPipeline complete pipeline contract',
                    scope: 'all',
                    module: 'nPipeline',
                    includeTests: true,
                    description: 'All nPipeline module lifecycle, configuration, schemas, routers, executors, listeners, utilities, and tests must remain fully documented.'
                },
                {
                    name: 'nService complete service and versioned-service contract',
                    scope: 'all',
                    module: 'nService',
                    includeTests: true,
                    description: 'All nService and vService module lifecycle, configuration, tenant, auth, authorization, communication, topology, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'nDefault complete baseline contract',
                    scope: 'all',
                    module: 'nDefault',
                    includeTests: true,
                    description: 'All nDefault module lifecycle, configuration, router, schema, pipeline, utility, and test scaffold contracts must remain fully documented.'
                },
                {
                    name: 'nPublish complete publish contract',
                    scope: 'all',
                    module: 'nPublish',
                    includeTests: true,
                    description: 'All nPublish module lifecycle, configuration, router, schema, pipeline, utility, and test scaffold contracts must remain fully documented.'
                },
                {
                    name: 'dataProcessor complete DEAP processing contract',
                    scope: 'all',
                    module: 'dataProcessor',
                    includeTests: true,
                    description: 'All dataProcessor module lifecycle, configuration, router, schema, pipeline, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'dataPublisher complete DEAP publishing contract',
                    scope: 'all',
                    module: 'dataPublisher',
                    includeTests: true,
                    description: 'All dataPublisher module lifecycle, configuration, router, schema, pipeline, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'cart complete commerce contract',
                    scope: 'all',
                    module: 'cart',
                    includeTests: true,
                    description: 'All cart module lifecycle, configuration, schema, router, interceptor, pipeline, service, utility, data, and test contracts must remain fully documented.'
                },
                {
                    name: 'order complete commerce contract',
                    scope: 'all',
                    module: 'order',
                    includeTests: true,
                    description: 'All order module lifecycle, configuration, initializer data, schema, router, interceptor, pipeline, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'cms complete content contract',
                    scope: 'all',
                    module: 'cms',
                    includeTests: true,
                    description: 'All CMS module lifecycle, configuration, initializer data, sample data, schema, router, interceptor, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'wcms complete workflow content contract',
                    scope: 'all',
                    module: 'wcms',
                    includeTests: true,
                    description: 'All WCMS module lifecycle, configuration, workflow initializer data, import headers, router, schema, interceptor, pipeline, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'cronjob complete scheduler contract',
                    scope: 'all',
                    module: 'cronjob',
                    includeTests: true,
                    description: 'All cronjob module lifecycle, configuration, initializer data, router, schema, pipeline, scheduler container, lifecycle trigger, node responsibility, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'nems complete event management contract',
                    scope: 'all',
                    module: 'nems',
                    includeTests: true,
                    description: 'All NEMS module lifecycle, configuration, initializer data, router, schema, event splitting, event dispatch, service, utility, and test contracts must remain fully documented.'
                },
                {
                    name: 'all modules complete source and test documentation contract',
                    scope: 'all',
                    includeTests: true,
                    description: 'Every checked Nodics module file and exported method across source, configuration, data, module lifecycle, and test surfaces must remain documented for AI tools and human developers.'
                }
            ],
            reportOnlyGates: [
                {
                    name: 'framework core rollout baseline',
                    scope: 'framework-core',
                    description: 'Non-blocking visibility for the remaining core framework documentation rollout.'
                }
            ]
        },
        commands: {
            'docs:coverage': {
                description: 'Inspect source documentation coverage for the target Nodics project.',
                handler: 'src/service/command/defaultDocumentationCoverageCommandService.js'
            },
            'quality:docs': {
                description: 'Run governed documentation quality gates for the target Nodics project.',
                handler: 'src/service/command/defaultDocumentationGatesCommandService.js'
            },
            'quality:copyright': {
                description: 'Validate standard Nodics copyright headers for JavaScript source and generated artifacts.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/quality/defaultCopyrightHeaderQualityService.js'
            },
            'llm:generate': {
                description: 'Generate module-owned LLM context for the target Nodics project.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/context/defaultGenerateModuleLlmContextService.js'
            },
            'llm:clean': {
                description: 'Remove generated module LLM context from the target Nodics project.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/context/defaultCleanModuleLlmContextService.js'
            },
            'llm:validate': {
                description: 'Validate generated module LLM context for the target Nodics project.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'test/moduleLlmContext.test.js'
            },
            'module:metadata': {
                description: 'Normalize canonical Nodics package metadata for the target project.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/context/defaultNormalizeModuleMetadataService.js'
            },
            'module:metadata:validate': {
                description: 'Validate canonical Nodics package metadata for the target project.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'test/moduleMetadata.test.js'
            },
            'mcp:governance': {
                description: 'Print read-only Nodics governance context for future MCP adapters.',
                handler: '@nTooling/mcp-governance',
                service: 'defaultMcpGovernanceService'
            },
            'mcp:validate': {
                description: 'Run approved Nodics validation checks and print structured MCP-safe results.',
                handler: '@nTooling/mcp-validate',
                service: 'defaultMcpValidationService'
            },
            'mcp:runtime-context': {
                description: 'Explain source-backed runtime hierarchy, active-module declarations, and override paths.',
                handler: '@nTooling/mcp-runtime-context',
                service: 'defaultMcpRuntimeContextService'
            },
            'mcp:mutation-plan': {
                description: 'Create guarded mutation or generation plans without executing writes by default.',
                handler: '@nTooling/mcp-mutation-plan',
                service: 'defaultMcpMutationGuardService'
            },
            'debug:clean': {
                description: 'Run Nodics clean under the debugger and break on startup.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/debug/defaultNodicsDebugService.js',
                arguments: ['clean', '--brk']
            },
            'debug:clean:inspect': {
                description: 'Run Nodics clean under the debugger without an initial breakpoint.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/debug/defaultNodicsDebugService.js',
                arguments: ['clean', '--no-brk']
            },
            'debug:build': {
                description: 'Run Nodics build under the debugger and break on startup.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/debug/defaultNodicsDebugService.js',
                arguments: ['build', '--brk']
            },
            'debug:build:inspect': {
                description: 'Run Nodics build under the debugger without an initial breakpoint.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/debug/defaultNodicsDebugService.js',
                arguments: ['build', '--no-brk']
            },
            'debug:start': {
                description: 'Run Nodics startup under the debugger and break on startup.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/debug/defaultNodicsDebugService.js',
                arguments: ['start', '--brk']
            },
            'debug:start:inspect': {
                description: 'Run Nodics startup under the debugger without an initial breakpoint.',
                handler: 'src/service/command/defaultNodeScriptCommandService.js',
                script: 'src/service/debug/defaultNodicsDebugService.js',
                arguments: ['start', '--no-brk']
            }
        }
    }
};
