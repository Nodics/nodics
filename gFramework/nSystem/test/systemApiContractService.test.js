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

const serverName = 'testLocalServer';
const nodeName = 'testLocalNode';
const serverPath = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-system-contract-server-'));
const serverContractDirectory = path.join(serverPath, 'generated', 'openapi');
const serverContract = {
    openapi: '3.0.3',
    info: {
        title: 'Server Contract',
        version: '1.0.0'
    },
    paths: {}
};
const nodeContract = {
    openapi: '3.0.3',
    info: {
        title: 'Node Contract',
        version: '1.0.0'
    },
    paths: {}
};

fs.mkdirSync(serverContractDirectory, { recursive: true });
fs.writeFileSync(path.join(serverContractDirectory, serverName + '.openapi.json'), JSON.stringify(serverContract), 'utf8');
fs.writeFileSync(path.join(serverContractDirectory, nodeName + '.openapi.json'), JSON.stringify(nodeContract), 'utf8');

let activeNodeName;

global.NODICS = {
    getServerName: function () {
        return serverName;
    },
    getServerPath: function () {
        return serverPath;
    },
    getNodicsHome: function () {
        return path.dirname(serverPath);
    },
    getNodeName: function () {
        return activeNodeName;
    },
    getNodePath: function () {
        throw new Error('Node path must not own generated reports');
    }
};

const service = require('../src/service/contract/defaultApiContractService');

(async function () {
    let serverResponse = await service.getOpenApiContract({});
    assert.strictEqual(serverResponse.code, 'SUC_SYS_00001');
    assert.strictEqual(serverResponse.data.info.title, 'Server Contract');
    assert.strictEqual(serverResponse.metadata.moduleName, serverName);
    assert.strictEqual(serverResponse.metadata.artifactPath, path.relative(path.dirname(serverPath), path.join(serverContractDirectory, serverName + '.openapi.json')));

    activeNodeName = nodeName;
    let nodeResponse = await service.getOpenApiContract({});
    assert.strictEqual(nodeResponse.code, 'SUC_SYS_00001');
    assert.strictEqual(nodeResponse.data.info.title, 'Node Contract');
    assert.strictEqual(nodeResponse.metadata.moduleName, nodeName);
    assert.strictEqual(nodeResponse.metadata.artifactPath, path.relative(path.dirname(serverPath), path.join(serverContractDirectory, nodeName + '.openapi.json')));

    let swaggerUiResponse = await service.getSwaggerUi({});
    assert.strictEqual(swaggerUiResponse.code, 'SUC_SYS_00002');
    assert.strictEqual(swaggerUiResponse.metadata.contentType, 'text/html; charset=utf-8');
    assert(swaggerUiResponse.data.includes('Nodics API Documentation'));
    assert(swaggerUiResponse.data.includes('url: "openapi"'));
    assert(swaggerUiResponse.data.includes('swagger/asset/swagger-ui.css'));

    let swaggerCssResponse = await service.getSwaggerAsset({
        httpRequest: {
            params: {
                assetName: 'swagger-ui.css'
            }
        }
    });
    assert.strictEqual(swaggerCssResponse.code, 'SUC_SYS_00003');
    assert.strictEqual(swaggerCssResponse.metadata.contentType, 'text/css; charset=utf-8');
    assert(Buffer.isBuffer(swaggerCssResponse.data));
    assert(swaggerCssResponse.data.length > 0);

    let blockedAssetError;
    try {
        await service.getSwaggerAsset({
            httpRequest: {
                params: {
                    assetName: '../package.json'
                }
            }
        });
    } catch (error) {
        blockedAssetError = error;
    }
    assert(blockedAssetError instanceof global.CLASSES.NodicsError);
    assert.strictEqual(blockedAssetError.code, 'ERR_SYS_00001');

    activeNodeName = 'missingNode';
    let missingContractError;
    try {
        await service.getOpenApiContract({});
    } catch (error) {
        missingContractError = error;
    }
    assert(missingContractError instanceof global.CLASSES.NodicsError);
    assert.strictEqual(missingContractError.code, 'ERR_SYS_00000');
    assert.strictEqual(missingContractError.contexts[0].service, 'DefaultApiContractService');
    assert.strictEqual(missingContractError.contexts[0].moduleName, 'missingNode');

    fs.rmSync(serverPath, { recursive: true, force: true });
    console.log('System API contract service behavior validated');
})().catch((error) => {
    fs.rmSync(serverPath, { recursive: true, force: true });
    console.error(error);
    process.exit(1);
});
