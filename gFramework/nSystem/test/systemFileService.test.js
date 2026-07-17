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

// @nodics-capability-behavior @nodics-area system
global.CONFIG = {
    get: function (key) {
        if (key === 'defaultErrorCodes') {
            return {
                NodicsError: 'ERR_SYS_00000'
            };
        }
        if (key === 'returnErrorStack') {
            return false;
        }
        return undefined;
    }
};

global.SERVICE = {
    DefaultStatusService: {
        get: function (code) {
            return {
                code: 500,
                message: 'Status message for ' + code
            };
        }
    }
};

global.UTILS = {
    isObject: function (value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    },
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (this.isObject(value) && Object.keys(value).length === 0);
    },
    extractFromError: function (error, message, defaultCode) {
        let errMsg = error.message || global.SERVICE.DefaultStatusService.get(defaultCode).message;
        if (message) {
            errMsg = errMsg + ' : ' + message;
        }
        return {
            code: defaultCode,
            name: error.name,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: errMsg,
            stack: error.stack
        };
    },
    extractFromMessage: function (message, defaultCode) {
        return {
            code: defaultCode,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: message
        };
    }
};

global.CLASSES = {
    NodicsError: require('../../nCommon/src/lib/nodicsError')
};

const nodicsHome = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-system-file-test-'));
const fixtureDirectory = path.join(nodicsHome, 'fixtures');
const fixtureFile = 'system-file.txt';
const fixtureContent = 'System file API test content';

fs.mkdirSync(fixtureDirectory, { recursive: true });
fs.writeFileSync(path.join(fixtureDirectory, fixtureFile), fixtureContent, 'utf8');

global.NODICS = {
    getNodicsHome: function () {
        return nodicsHome;
    }
};

const service = require('../src/service/file/defaultFileService');

(async function () {
    let missingTypeError;
    try {
        await service.getFileContent({
            fileName: fixtureFile
        });
    } catch (error) {
        missingTypeError = error;
    }
    assert(missingTypeError instanceof global.CLASSES.NodicsError);
    assert.strictEqual(missingTypeError.code, 'ERR_SYS_00001');

    let contentResponse = await service.getFileContent({
        type: 'static',
        path: 'fixtures',
        fileName: fixtureFile
    });
    assert.strictEqual(contentResponse.code, 'SUC_SYS_00001');
    assert.strictEqual(contentResponse.data, fixtureContent);

    let downloadResponse = await service.downloadFile({
        path: 'fixtures',
        fileName: fixtureFile
    });
    assert.strictEqual(downloadResponse.success, true);
    assert.strictEqual(downloadResponse.code, 'SUC_SYS_00001');
    assert.strictEqual(downloadResponse.filePath, path.join(nodicsHome, 'fixtures', fixtureFile));

    let missingFileError;
    try {
        await service.downloadFile({
            path: 'fixtures',
            fileName: 'missing-file.txt'
        });
    } catch (error) {
        missingFileError = error;
    }
    assert(missingFileError instanceof global.CLASSES.NodicsError);
    assert.strictEqual(missingFileError.code, 'ERR_SYS_00001');

    fs.rmSync(nodicsHome, { recursive: true, force: true });
    console.log('System file service behavior validated');
})().catch((error) => {
    fs.rmSync(nodicsHome, { recursive: true, force: true });
    console.error(error);
    process.exit(1);
});
