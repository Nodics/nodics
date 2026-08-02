/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTest/test/GeneratedTestRunnerLifecycleContract
 * @description Proves generated-test execution fails loudly when deterministic
 * generation has not produced test artifacts.
 * @layer test
 * @owner nTest
 * @override Project test runners may extend generated-test discovery, but must
 * not treat missing generated artifacts as passing release evidence.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const repositoryRoot = path.resolve(__dirname, '../../..');
const runnerPath = path.join(repositoryRoot, 'gFramework/nTest/src/service/tooling/defaultGeneratedTestRunnerService.js');
const cleanRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-generated-test-empty-'));

try {
    const result = spawnSync(process.execPath, [runnerPath], {
        cwd: cleanRoot,
        env: Object.assign({}, process.env, { NODICS_HOME: cleanRoot }),
        encoding: 'utf8'
    });

    assert.notStrictEqual(result.status, 0,
        'Generated test runner must fail when no generated tests exist');
    assert(String(result.stderr).includes('No generated tests found'),
        'Generated test runner must explain that build/generation is required');
    assert(String(result.stderr).includes('Run npm run build'),
        'Generated test runner must direct developers to deterministic generation');
} finally {
    fs.rmSync(cleanRoot, { recursive: true, force: true });
}

console.log('Generated test runner lifecycle contract validated');
