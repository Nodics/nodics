/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/test/moduleLlmContext
 * @description Validates tool-neutral module context structure, generated inventories, source fingerprints, schema summaries, and documentation status contracts.
 * @layer test
 * @owner nTooling
 * @override New context contract versions should extend these assertions without weakening ownership or fingerprint validation.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const {
    collectModuleOwnedFiles,
    createFilesFingerprint,
    scanModules
} = require('../src/service/context/defaultModuleLlmContextUtilsService');

const modules = scanModules();
const globalContextPath = path.join(__dirname, '..', '..', '..', 'gSetup', 'llm', 'README.md');
const globalContext = fs.readFileSync(globalContextPath, 'utf8');

assert(globalContext.includes('tool-neutral'), 'Global context must explicitly remain tool-neutral');
assert(globalContext.includes('Do not make AI guidance specific to one AI vendor.'),
    'Global context must prohibit vendor-specific guidance');

assert(modules.length > 0, 'No Nodics modules were discovered');

modules.forEach(module => {
    let llmDirectory = path.join(module.path, 'llm');
    let generatedDirectory = path.join(llmDirectory, 'generated');
    assert(fs.existsSync(llmDirectory), 'Missing llm folder for module: ' + module.relativePath);
    assert(fs.existsSync(path.join(llmDirectory, 'README.md')), 'Missing llm README for module: ' + module.relativePath);
    if (module.relativePath === 'gSetup') {
        return;
    }
    assert(fs.existsSync(generatedDirectory), 'Missing generated llm folder for module: ' + module.relativePath);
    ['module-context.md', 'schemas.md', 'tests.md', 'manifest.json'].forEach(fileName => {
        assert(fs.existsSync(path.join(generatedDirectory, fileName)), 'Missing generated LLM file ' + fileName + ' for module: ' + module.relativePath);
    });
    assert(!fs.existsSync(path.join(generatedDirectory, 'files.md')),
        'Legacy generated files.md must be consolidated into module-context.md: ' + module.relativePath);

    const manifest = JSON.parse(fs.readFileSync(path.join(generatedDirectory, 'manifest.json'), 'utf8'));
    const ownedFiles = collectModuleOwnedFiles(module.path);
    const currentFingerprint = createFilesFingerprint(ownedFiles);
    assert.strictEqual(manifest.contextVersion, 3, 'Unsupported context manifest version for module: ' + module.relativePath);
    assert.strictEqual(manifest.ownedFiles, ownedFiles.length, 'Incomplete owned-file inventory for module: ' + module.relativePath);
    assert.strictEqual(manifest.sourceFingerprint, currentFingerprint, 'Stale generated context for module: ' + module.relativePath);
    assert(manifest.documentation && Number.isInteger(manifest.documentation.documented),
        'Missing documentation summary for module: ' + module.relativePath);
    const allowedStatuses = new Set(['documented', 'partially-documented', 'undocumented', 'inventory-only']);
    const summaryTotal = Object.values(manifest.documentation).reduce((total, count) => total + count, 0);
    assert.strictEqual(summaryTotal, ownedFiles.length, 'Documentation summary does not cover every owned file: ' + module.relativePath);

    const filesContext = fs.readFileSync(path.join(generatedDirectory, 'module-context.md'), 'utf8');
    ownedFiles.forEach(relativeFile => {
        const row = filesContext.split('\n').find(line => line.startsWith('| `' + relativeFile + '` |'));
        assert(row, 'Missing file context entry for ' + relativeFile);
        const status = Array.from(allowedStatuses).find(value => row.includes('| `' + value + '` |'));
        assert(status, 'Invalid documentation status for ' + relativeFile);
        if (status === 'partially-documented' || status === 'undocumented') {
            assert(row.includes('add @') || row.includes('add JSDoc'),
                'Incomplete file does not explain its documentation gaps: ' + relativeFile);
        }
    });
});

console.log('Module LLM context validated: ' + modules.length + ' modules');
