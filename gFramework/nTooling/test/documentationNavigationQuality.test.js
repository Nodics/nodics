/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const navigation = require('../src/service/quality/defaultDocumentationNavigationQualityService');

/**
 * @module nTooling/test/documentationNavigationQuality
 * @description Proves positive, negative, boundary, reachability, path-case, continuation, and exhaustive module-catalog documentation contracts.
 * @layer test
 * @owner nTooling
 * @override Projects may add navigation fixtures while preserving the framework quality-gate contract.
 */

function write(rootDir, relativePath, content) {
    const filePath = path.join(rootDir, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
}

function createFixture() {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-doc-navigation-'));
    write(rootDir, 'README.md', '# Entry\n\n[Docs](gDocs/README.md)\n');
    write(rootDir, 'gDocs/README.md', '# Docs\n\n[Guide](guide.md)\n[Catalog](reference/module-catalog.md)\n');
    write(rootDir, 'gDocs/guide.md', '# Guide\n\n## Continue\n\n- [Home](README.md)\n');
    write(rootDir, 'gDocs/reference/module-catalog.md', '# Catalog\n\n- [sample](../../sample/README.md)\n\n## Continue\n\n- [Home](../README.md)\n');
    write(rootDir, 'sample/package.json', JSON.stringify({ name: 'sample' }));
    write(rootDir, 'sample/README.md', '# Sample\n');
    return rootDir;
}

const policy = {
    requiredEntryPoints: ['gDocs/guide.md'],
    moduleCatalog: 'gDocs/reference/module-catalog.md'
};

const positiveRoot = createFixture();
const positiveReport = navigation.collectNavigationReport(positiveRoot, policy);
assert.strictEqual(navigation.hasFailures(positiveReport), false,
    'a fully linked public journey and exhaustive module catalog should pass');

const negativeRoot = createFixture();
write(negativeRoot, 'gDocs/orphan.md', '# Orphan\n');
fs.appendFileSync(path.join(negativeRoot, 'gDocs/guide.md'), '\n[Broken](missing.md)\n');
fs.appendFileSync(path.join(negativeRoot, 'gDocs/README.md'), '\n[Wrong case](Guide.md)\n');
write(negativeRoot, 'unlisted/package.json', JSON.stringify({ name: 'unlisted' }));
write(negativeRoot, 'unlisted/README.md', '# Unlisted\n');

const negativeReport = navigation.collectNavigationReport(negativeRoot, policy);
assert.ok(negativeReport.brokenLinks.some(item => item.target === 'missing.md'),
    'missing local link targets must fail');
assert.ok(negativeReport.caseMismatches.some(item => item.target === 'Guide.md') ||
    negativeReport.brokenLinks.some(item => item.target === 'Guide.md'),
    'wrong-case link targets must fail on both case-sensitive and case-insensitive filesystems');
assert.ok(negativeReport.unreachablePages.includes('gDocs/orphan.md'),
    'orphan public pages must fail reachability');
assert.ok(negativeReport.deadEndPages.includes('gDocs/orphan.md'),
    'public task pages without Continue navigation must fail');
assert.ok(negativeReport.missingModuleReadmes.includes('unlisted/README.md'),
    'every package-defined module README must appear in the catalog');
assert.strictEqual(navigation.hasFailures(negativeReport), true,
    'any navigation contract violation must fail the gate');

fs.rmSync(positiveRoot, { recursive: true, force: true });
fs.rmSync(negativeRoot, { recursive: true, force: true });

console.log('documentation navigation quality tests passed');
