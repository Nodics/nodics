/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/structureGeneratorAlignment
 * @description Verifies that contract-driven structure generation produces modules that pass the canonical structure compliance audit.
 * @layer test
 * @owner nTooling
 * @override New generator kinds may extend this fixture while preserving structure-matrix and audit compatibility.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const structureGeneratorService = require('../src/service/generation/defaultStructureGeneratorService');
const structureComplianceQualityService = require('../src/service/quality/defaultStructureComplianceQualityService');

function generate(rootPath, args) {
    const previousCwd = process.cwd();
    process.chdir(rootPath);
    try {
        return structureGeneratorService.generate(structureGeneratorService.createOptions(args));
    } finally {
        process.chdir(previousCwd);
    }
}

const projectHome = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-structure-generate-'));
try {
    assert.throws(() => generate(projectHome, [
        '--kind=group',
        '--name=missingIndex',
        '--path=missingIndex'
    ]), /unique ordered --index/, 'Generation must fail closed without an explicit module index');
    generate(projectHome, [
        '--kind=project',
        '--name=acme',
        '--path=acme',
        '--groupName=acmeGroup',
        '--index=9000.0'
    ]);
    generate(projectHome, [
        '--kind=group',
        '--name=modules',
        '--path=acme/modules',
        '--index=9000.1'
    ]);
    generate(projectHome, [
        '--kind=capability',
        '--name=acmeCore',
        '--path=acme/modules/acmeCore',
        '--index=9000.11'
    ]);
    generate(projectHome, [
        '--kind=environment',
        '--name=local',
        '--path=acme/envs/local',
        '--index=9000.2'
    ]);
    generate(projectHome, [
        '--kind=server',
        '--name=apiServer',
        '--path=acme/envs/local/apiServer',
        '--index=9000.21'
    ]);
    generate(projectHome, [
        '--kind=node',
        '--name=node0',
        '--path=acme/envs/local/apiServer/node0',
        '--index=9000.211'
    ]);
    generate(projectHome, [
        '--kind=provider',
        '--name=oracleProvider',
        '--path=acme/modules/oracleProvider',
        '--index=9000.12'
    ]);

    const report = structureComplianceQualityService.collectReport({
        rootDir: projectHome,
        includeInfo: false
    });
    assert.strictEqual(report.errorCount, 0, 'Generated structure must not contain audit errors');
    assert.strictEqual(report.warningCount, 0, 'Generated structure must not contain audit warnings');
    assert(fs.existsSync(path.join(projectHome, 'acme/modules/acmeCore/src/router/routers.js')),
        'Capability generation must use routers.js');
    assert(fs.existsSync(path.join(projectHome, 'acme/modules/acmeCore/src/pipelines/pipelines.js')),
        'Capability generation must use pipelines.js');
    assert(fs.existsSync(path.join(projectHome, 'acme/modules/acmeCore/src/search/indexes.js')),
        'Capability generation must include search indexes.js');
    assert(fs.existsSync(path.join(projectHome, 'acme/modules/acmeCore/src/utils/enums.js')),
        'Capability generation must include enums.js');
    assert(fs.existsSync(path.join(projectHome, 'acme/modules/acmeCore/src/utils/statusDefinitions.js')),
        'Capability generation must include statusDefinitions.js');
    assert(fs.existsSync(path.join(projectHome, 'acme/modules/acmeCore/src/service/defaultSampleService.js')),
        'Capability generation must include defaultSampleService.js');
    assert(!fs.existsSync(path.join(projectHome, 'acme/modules/acmeCore/llm', 'README.md')),
        'Capability generation must not create module-local llm README files');
    assert(fs.existsSync(path.join(projectHome, 'acme/modules/acmeCore/llm/contracts/README.md')),
        'Capability generation must include llm/contracts/README.md');
    assert(fs.existsSync(path.join(projectHome, 'acme/modules/acmeCore/llm/examples/README.md')),
        'Capability generation must include llm/examples/README.md');
    assert(!fs.existsSync(path.join(projectHome, 'acme/modules/acmeCore/src/router/router.js')),
        'Capability generation must not create retired router.js');
    assert(!fs.existsSync(path.join(projectHome, 'acme/modules/acmeCore/src/pipelines/pipelinesDefinition.js')),
        'Capability generation must not create retired pipelinesDefinition.js');
} finally {
    fs.rmSync(projectHome, { recursive: true, force: true });
}

console.log('Nodics structure generator alignment validated');
