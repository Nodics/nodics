/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/structureComplianceAudit
 * @description Verifies that the structure compliance audit reports Nodics structure-matrix gaps without mutating project files.
 * @layer test
 * @owner nTooling
 * @override Additional structure-matrix rules may extend this fixture while preserving report-only audit behavior and explicit fail-on-gap mode.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const structureComplianceQualityService = require('../src/service/quality/defaultStructureComplianceQualityService');

function write(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
}

function packageJson(name, kind, owns, extra) {
    return JSON.stringify(Object.assign({
        name: name,
        version: '0.0.1',
        description: name + ' fixture module',
        index: '9000.0',
        main: 'nodics.js',
        nodics: {
            kind: kind,
            displayName: name + ' Fixture',
            runtimeModule: true,
            loadableByNodicsModuleLoader: true,
            owns: owns || ['configuration', 'llm'],
            runtime: {
                router: false,
                publish: false,
                web: false
            }
        }
    }, extra || {}), null, 2);
}

function createModule(rootPath, relativePath, name, kind, owns, extraPackage, propertiesSource) {
    const modulePath = path.join(rootPath, relativePath);
    write(path.join(modulePath, 'package.json'), packageJson(name, kind, owns, extraPackage));
    write(path.join(modulePath, 'nodics.js'), 'module.exports = {};\n');
    write(path.join(modulePath, 'AGENTS.md'), '# ' + name + ' Agents\n');
    write(path.join(modulePath, 'README.md'), '# ' + name + '\n');
    write(path.join(modulePath, 'llm/contracts/README.md'), '# Contracts\n');
    write(path.join(modulePath, 'llm/examples/README.md'), '# Examples\n');
    write(path.join(modulePath, 'config/properties.js'), propertiesSource || 'module.exports = {};\n');
    write(path.join(modulePath, 'config/prescripts.js'), 'module.exports = {};\n');
    write(path.join(modulePath, 'config/postscripts.js'), 'module.exports = {};\n');
    return modulePath;
}

function findingCodes(report) {
    return report.findings.map(finding => finding.code);
}

const projectHome = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-structure-audit-'));
try {
    createModule(projectHome, 'acme', 'acme', 'project', ['composition', 'configuration', 'llm'], {
        groupName: 'acmeGroup'
    });
    createModule(projectHome, 'acme/envs', 'envs', 'group', ['composition', 'configuration', 'llm']);
    createModule(projectHome, 'acme/envs/local', 'local', 'group', ['composition', 'configuration', 'llm']);
    createModule(projectHome, 'acme/envs/local/apiServer', 'apiServer', 'server',
        ['composition', 'configuration', 'router', 'service', 'utility', 'llm'],
        {},
        'module.exports = { activeModules: { groups: [], modules: ["apiServer"] } };\n');
    write(path.join(projectHome, 'acme/envs/local/apiServer/src/router/routers.js'), 'module.exports = {};\n');
    write(path.join(projectHome, 'acme/envs/local/apiServer/src/router/appConfig.js'), 'module.exports = {};\n');
    write(path.join(projectHome, 'acme/envs/local/apiServer/src/service/defaultSampleService.js'), [
        'module.exports = {',
        '  init: function () { return Promise.resolve(true); },',
        '  postInit: function () { return Promise.resolve(true); }',
        '};',
        ''
    ].join('\n'));
    write(path.join(projectHome, 'acme/envs/local/apiServer/src/utils/utils.js'), 'module.exports = {};\n');
    write(path.join(projectHome, 'acme/envs/local/apiServer/src/utils/enums.js'), 'module.exports = {};\n');
    write(path.join(projectHome, 'acme/envs/local/apiServer/src/utils/statusDefinitions.js'), 'module.exports = {};\n');
    createModule(projectHome, 'acme/envs/local/apiServer/node0', 'node0', 'node',
        ['configuration', 'llm'],
        {},
        'module.exports = { nodeId: "node0" };\n');

    const cleanReport = structureComplianceQualityService.collectReport({
        rootDir: projectHome,
        includeInfo: false
    });
    assert.strictEqual(cleanReport.errorCount, 0, 'Compliant fixture must not report structure errors');
    assert.strictEqual(cleanReport.warningCount, 0, 'Compliant fixture must not report structure warnings');

    const badModule = createModule(projectHome, 'badProject', 'badProject', 'project', ['configuration', 'llm'], {}, [
        'module.exports = {',
        '  activeModules: { groups: [], modules: [] }',
        '};',
        ''
    ].join('\n'));
    fs.mkdirSync(path.join(badModule, 'src/router'), { recursive: true });
    write(path.join(badModule, 'src/router/router.js'), 'module.exports = {};\n');

    const gapReport = structureComplianceQualityService.collectReport({
        rootDir: projectHome,
        includeInfo: false
    });
    const codes = findingCodes(gapReport);
    assert(codes.includes('missing-project-group-name'),
        'Audit must report project metadata without groupName');
    assert(codes.includes('active-modules-outside-server'),
        'Audit must report activeModules outside server configuration');
    assert(codes.includes('retired-router-file'),
        'Audit must report retired router.js files');
    createModule(projectHome, 'logicConfig', 'logicConfig', 'capability', ['configuration', 'llm'], {}, [
        'module.exports = {',
        '  sample: { values: [1, 2, 3].map(value => value * 2) }',
        '};',
        ''
    ].join('\n'));
    const logicGapReport = structureComplianceQualityService.collectReport({
        rootDir: projectHome,
        includeInfo: false
    });
    assert(findingCodes(logicGapReport).includes('properties-executable-logic'),
        'Audit must report executable logic inside properties.js');
    write(path.join(badModule, 'docs/README.md'), '# Duplicate documentation entry\n');
    const docsGapReport = structureComplianceQualityService.collectReport({
        rootDir: projectHome,
        includeInfo: false
    });
    assert(findingCodes(docsGapReport).includes('parallel-module-docs'),
        'Audit must reject parallel module docs directories');
    assert(structureComplianceQualityService.hasComplianceGaps(gapReport),
        'Audit must expose gaps for fail-on-gap mode');
} finally {
    fs.rmSync(projectHome, { recursive: true, force: true });
}

console.log('Nodics structure compliance audit validated');
