/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

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
const copyrightHeaders = require('../src/quality/checkCopyrightHeaders');

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-copyright-'));
const plainFile = path.join(tempRoot, 'plain.js');
const shebangFile = path.join(tempRoot, 'tool.js');

fs.writeFileSync(plainFile, 'module.exports = {};\n', 'utf8');
fs.writeFileSync(shebangFile, '#!/usr/bin/env node\nconsole.log("ok");\n', 'utf8');

let initial = copyrightHeaders.inspectFiles({
    rootDir: tempRoot,
    fix: false
});
assert.strictEqual(initial.filesChecked, 2);
assert.strictEqual(initial.filesMissingHeader.length, 2);

let fixed = copyrightHeaders.inspectFiles({
    rootDir: tempRoot,
    fix: true
});
assert.strictEqual(fixed.filesFixed.length, 2);

let finalReport = copyrightHeaders.inspectFiles({
    rootDir: tempRoot,
    fix: false
});
assert.strictEqual(finalReport.filesMissingHeader.length, 0);
assert(fs.readFileSync(plainFile, 'utf8').startsWith(copyrightHeaders.requiredHeader));
assert(fs.readFileSync(shebangFile, 'utf8').startsWith('#!/usr/bin/env node\n' + copyrightHeaders.requiredHeader));

console.log('Copyright header governance validated');
