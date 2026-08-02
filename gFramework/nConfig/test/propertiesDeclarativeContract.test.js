/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nConfig/test/propertiesDeclarativeContract
 * @description Guards `config/properties.js` files as declarative layered configuration, not executable builders or service logic.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const EXCLUDED_DIRECTORIES = new Set(['.git', 'node_modules', 'llm', 'generated']);
const DISALLOWED_PATTERNS = [
    { name: 'spread syntax', pattern: /\.\.\./ },
    { name: 'module import', pattern: /\brequire\s*\(/ },
    { name: 'environment access', pattern: /\bprocess\s*\./ },
    { name: 'runtime registry access', pattern: /\b(NODICS|CONFIG|SERVICE|CLASSES)\s*\./ },
    { name: 'arrow function', pattern: /=>/ },
    { name: 'inline function', pattern: /function\s*\(/ },
    { name: 'array builder or mutation', pattern: /\.(map|forEach|reduce|filter|sort|push|concat|slice)\s*\(/ },
    { name: 'object construction helper', pattern: /Object\.(assign|freeze)\s*\(/ },
    { name: 'runtime collection constructor', pattern: /new\s+(Set|Map|Date)\s*\(/ },
    { name: 'undefined identifier', pattern: /\bundefined\b/ },
    { name: 'logical expression', pattern: /(&&|\|\|)/ },
    { name: 'ternary expression', pattern: /\?/ },
    { name: 'arithmetic or concatenation expression', pattern: /(^|[^+\-])[-+*/%]\s*[^,\]\}\n]/ },
    { name: 'call expression', pattern: /[A-Za-z_$][A-Za-z0-9_$]*\s*\(/ }
];

function findPropertiesFiles(directory, results) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        if (entry.isDirectory()) {
            if (!EXCLUDED_DIRECTORIES.has(entry.name)) {
                findPropertiesFiles(path.join(directory, entry.name), results);
            }
            return;
        }
        if (entry.name === 'properties.js' && path.basename(path.dirname(entry.name)) !== 'test') {
            results.push(path.join(directory, entry.name));
        }
    });
}

function stripComments(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .map(line => line.replace(/\/\/.*$/g, ''))
        .join('\n');
}

function stripStringLiterals(source) {
    return source
        .replace(/'(?:\\.|[^'\\])*'/g, "''")
        .replace(/"(?:\\.|[^"\\])*"/g, '""')
        .replace(/`(?:\\.|[^`\\])*`/g, '``');
}

const files = [];
findPropertiesFiles(ROOT, files);

const violations = [];
files.forEach(file => {
    const source = stripComments(stripStringLiterals(fs.readFileSync(file, 'utf8')));
    DISALLOWED_PATTERNS.forEach(rule => {
        if (rule.pattern.test(source)) {
            violations.push(path.relative(ROOT, file) + ' contains ' + rule.name);
        }
    });
});

assert.deepStrictEqual(violations, [], 'properties.js files must remain declarative configuration');
assert(files.length > 0, 'No properties.js files were scanned');

console.log('Properties declarative contract validated');
