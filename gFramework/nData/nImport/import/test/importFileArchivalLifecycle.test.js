/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/importFileArchivalLifecycle
 * @description Verifies finalized import processing does not complete before
 * processed files reach their governed success location.
 * @layer test
 * @owner import
 * @override Later import processors must preserve completion-after-archival.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const serviceDefinition = require(
    '../src/service/process/init/defaultDataImportProcessService'
);

(async function () {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-import-archive-'));
    const filePath = path.join(workspace, 'record_processing.js');
    fs.writeFileSync(filePath, 'module.exports = [{ code: "record" }];\n');

    let releaseMove;
    let moveStarted = false;
    let settled = false;
    global.NODICS = {
        /** Returns the isolated test workspace. */
        getNodicsHome: function () {
            return workspace;
        }
    };
    global.CLASSES = {
        NodicsError: Error
    };
    global.SERVICE = {
        DefaultPipelineService: {
            /** Simulates successful import-pipeline execution. */
            start: function () {
                return Promise.resolve(true);
            }
        },
        DefaultFileHandlerService: {
            /** Holds file movement until the test explicitly releases it. */
            moveFile: function () {
                moveStarted = true;
                return new Promise(resolve => {
                    releaseMove = resolve;
                });
            }
        },
        DefaultImportUtilityService: {
            /** Reports that no additional import work remains. */
            isImportPending: function () {
                return false;
            }
        }
    };

    const service = Object.assign({
        LOG: {
            /** Discards debug output during the focused contract test. */
            debug: function () {},
            /** Discards error output during the focused contract test. */
            error: function () {}
        }
    }, serviceDefinition);
    const request = {
        tenant: 'default',
        dataFiles: {
            record: {
                file: filePath,
                name: 'record',
                processed: [],
                done: false
            }
        },
        inputPath: {
            successPath: path.join(workspace, 'success')
        }
    };
    const promise = service.processFiles(request, {}, {
        phase: 0,
        phaseLimit: 1,
        pendingFiles: ['record']
    }).then(result => {
        settled = true;
        return result;
    });

    await new Promise(resolve => setImmediate(resolve));
    assert.strictEqual(moveStarted, true);
    assert.strictEqual(settled, false);
    releaseMove(true);
    assert.strictEqual(await promise, true);
    assert.strictEqual(settled, true);
    fs.rmSync(workspace, { recursive: true, force: true });
    console.log('Import file archival lifecycle contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
