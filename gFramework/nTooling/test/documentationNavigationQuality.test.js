/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
    write(rootDir, 'README.md', '# Entry\n\n[Docs](publicDocs/README.md)\n');
    write(rootDir, 'publicDocs/README.md', '# Docs\n\n[Guide](guide.md)\n[Catalog](reference/module-catalog.md)\n');
    write(rootDir, 'publicDocs/guide.md', '# Guide\n\n## Continue\n\n- [Home](README.md)\n');
    write(rootDir, 'publicDocs/reference/module-catalog.md', '# Catalog\n\n- [sample](../../sample/README.md)\n\n## Continue\n\n- [Home](../README.md)\n');
    write(rootDir, 'sample/package.json', JSON.stringify({ name: 'sample' }));
    write(rootDir, 'sample/README.md', '# Sample\n');
    return rootDir;
}

const policy = {
    requiredEntryPoints: ['publicDocs/guide.md'],
    moduleCatalog: 'publicDocs/reference/module-catalog.md'
};

const positiveRoot = createFixture();
const positiveReport = navigation.collectNavigationReport(positiveRoot, policy);
assert.strictEqual(navigation.hasFailures(positiveReport), false,
    'a fully linked public journey and exhaustive module catalog should pass');

const negativeRoot = createFixture();
write(negativeRoot, 'publicDocs/orphan.md', '# Orphan\n');
fs.appendFileSync(path.join(negativeRoot, 'publicDocs/guide.md'), '\n[Broken](missing.md)\n');
fs.appendFileSync(path.join(negativeRoot, 'publicDocs/README.md'), '\n[Wrong case](Guide.md)\n');
write(negativeRoot, 'unlisted/package.json', JSON.stringify({ name: 'unlisted' }));
write(negativeRoot, 'unlisted/README.md', '# Unlisted\n');

const negativeReport = navigation.collectNavigationReport(negativeRoot, policy);
assert.ok(negativeReport.brokenLinks.some(item => item.target === 'missing.md'),
    'missing local link targets must fail');
assert.ok(negativeReport.caseMismatches.some(item => item.target === 'Guide.md') ||
    negativeReport.brokenLinks.some(item => item.target === 'Guide.md'),
    'wrong-case link targets must fail on both case-sensitive and case-insensitive filesystems');
assert.ok(negativeReport.unreachablePages.includes('publicDocs/orphan.md'),
    'orphan public pages must fail reachability');
assert.ok(negativeReport.deadEndPages.includes('publicDocs/orphan.md'),
    'public task pages without Continue navigation must fail');
assert.ok(negativeReport.missingModuleReadmes.includes('unlisted/README.md'),
    'every package-defined module README must appear in the catalog');
assert.strictEqual(navigation.hasFailures(negativeReport), true,
    'any navigation contract violation must fail the gate');

fs.rmSync(positiveRoot, { recursive: true, force: true });
fs.rmSync(negativeRoot, { recursive: true, force: true });

console.log('documentation navigation quality tests passed');
