/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/test/copyrightHeaderGovernance
 * @description Validates Nodics copyright header detection and normalization.
 * @layer test
 * @owner nTooling
 * @override Projects with different legal text should replace the copyright checker and update this contract.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const copyrightHeaders = require('../src/service/quality/defaultCopyrightHeaderQualityService');

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-copyright-'));
const plainFile = path.join(tempRoot, 'plain.js');
const shebangFile = path.join(tempRoot, 'tool.js');
const previousHeaderFile = path.join(tempRoot, 'previousHeader.js');

fs.writeFileSync(plainFile, 'module.exports = {};\n', 'utf8');
fs.writeFileSync(shebangFile, '#!/usr/bin/env node\nconsole.log("ok");\n', 'utf8');
fs.writeFileSync(previousHeaderFile, copyrightHeaders.requiredHeader.replace('2026', '2017') + '\nmodule.exports = {};\n', 'utf8');

let initial = copyrightHeaders.inspectFiles({
    rootDir: tempRoot,
    fix: false
});
assert.strictEqual(initial.filesChecked, 3);
assert.strictEqual(initial.filesMissingHeader.length, 3);

let fixed = copyrightHeaders.inspectFiles({
    rootDir: tempRoot,
    fix: true
});
assert.strictEqual(fixed.filesFixed.length, 3);

let finalReport = copyrightHeaders.inspectFiles({
    rootDir: tempRoot,
    fix: false
});
assert.strictEqual(finalReport.filesMissingHeader.length, 0);
assert(fs.readFileSync(plainFile, 'utf8').startsWith(copyrightHeaders.requiredHeader));
assert(fs.readFileSync(shebangFile, 'utf8').startsWith('#!/usr/bin/env node\n' + copyrightHeaders.requiredHeader));
assert(!fs.readFileSync(previousHeaderFile, 'utf8').includes('Copyright (c) 2017'));
assert(copyrightHeaders.requiredHeader.includes('Copyright (c) 2026 Nodics All rights reserved.'));

console.log('Copyright header governance validated');
