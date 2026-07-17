/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../../../../');
const dataTypes = ['init', 'core', 'sample'];
const Nodics = require(path.join(repoRoot, 'gFramework/nConfig/bin/nodics'));
const Config = require(path.join(repoRoot, 'gFramework/nConfig/bin/config'));
const utils = require(path.join(repoRoot, 'gFramework/nConfig/src/utils/utils'));
const initService = require(path.join(repoRoot, 'gFramework/nConfig/src/service/DefaultFrameworkInitializerService'));

function getDefaultServerName() {
    let env = require(path.join(repoRoot, 'env.js'));
    return env.defaultOptions.defaultServer || 'startioLocalServer';
}

function getDefaultServerActiveModules() {
    let serverName = getDefaultServerName();
    let originalArgv = process.argv.slice();
    global.NODICS = new Nodics();
    global.CONFIG = new Config();
    NODICS.init({
        NODICS_HOME: repoRoot,
        defaultServer: serverName
    });
    utils.loadRawModuleList(NODICS.getNodicsHome());
    process.argv = process.argv.slice(0, 2);
    NODICS.initEnvironment({
        defaultServer: serverName
    });
    process.argv = originalArgv;
    initService.prepareOptions();
    initService.LOG = {
        debug: function () { },
        info: function () { },
        warn: function () { },
        error: function () { }
    };
    initService.loadModuleIndex();
    initService.loadModulesMetaData();
    initService.loadConfigurations();
    initService.validateResolvedConfiguration();
    return NODICS.getActiveModules().map(moduleName => NODICS.getRawModule(moduleName)).filter(Boolean);
}

function walk(dir, matcher, result = []) {
    if (!fs.existsSync(dir)) {
        return result;
    }
    fs.readdirSync(dir).forEach(entry => {
        let fullPath = path.join(dir, entry);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, matcher, result);
        } else if (!matcher || matcher(fullPath, entry)) {
            result.push(fullPath);
        }
    });
    return result;
}

function getActiveDataTypeRoots(activeModules) {
    let result = [];
    activeModules.forEach(moduleObject => {
        dataTypes.forEach(dataType => {
            let dataRoot = path.join(moduleObject.path, 'data', dataType);
            if (fs.existsSync(dataRoot)) {
                result.push({
                    moduleName: moduleObject.name,
                    dataType: dataType,
                    dataRoot: dataRoot
                });
            }
        });
    });
    return result;
}

function getHeaderFiles(dataRoot) {
    return walk(dataRoot, (_filePath, fileName) => {
        let baseName = fileName.substring(0, fileName.lastIndexOf('.'));
        return baseName.endsWith('Header') || baseName.endsWith('Headers');
    });
}

function getDataFileKeys(dataRoot) {
    return walk(dataRoot, (_filePath, fileName) => {
        let baseName = fileName.split('.').shift();
        return baseName && !baseName.endsWith('Header') && !baseName.endsWith('Headers');
    }).map(filePath => {
        let fileName = path.basename(filePath);
        return fileName.split('.').shift() + '_' + fileName.split('.').pop();
    });
}

function getEnabledHeaders(headerFiles) {
    let headers = [];
    headerFiles.forEach(headerFile => {
        let headerExport = require(headerFile);
        Object.keys(headerExport).forEach(moduleName => {
            Object.keys(headerExport[moduleName]).forEach(headerName => {
                let header = headerExport[moduleName][headerName];
                if (header.options && header.options.enabled) {
                    headers.push({
                        file: headerFile,
                        moduleName: moduleName,
                        headerName: headerName,
                        dataFilePrefix: header.options.dataFilePrefix || headerName
                    });
                }
            });
        });
    });
    return headers;
}

let failures = [];
let scannedRoots = [];
let activeModules = getDefaultServerActiveModules();
let activeDataTypeRoots = getActiveDataTypeRoots(activeModules);

activeDataTypeRoots.forEach(dataTypeRoot => {
    let headerFiles = getHeaderFiles(dataTypeRoot.dataRoot);
    let dataFileKeys = getDataFileKeys(path.join(dataTypeRoot.dataRoot, 'data'));
    let enabledHeaders = getEnabledHeaders(headerFiles);
    if (headerFiles.length > 0 || dataFileKeys.length > 0) {
        scannedRoots.push(dataTypeRoot.dataRoot.replace(repoRoot + path.sep, ''));
    }
    enabledHeaders.forEach(header => {
        let matched = dataFileKeys.some(fileKey => fileKey.startsWith(header.dataFilePrefix));
        if (!matched) {
            failures.push([
                dataTypeRoot.moduleName,
                dataTypeRoot.dataRoot.replace(repoRoot + path.sep, ''),
                header.file.replace(repoRoot + path.sep, ''),
                header.moduleName + '.' + header.headerName,
                header.dataFilePrefix
            ].join(' | '));
        }
    });
});

assert(scannedRoots.length > 0, 'Expected to find core or sample data roots');
assert.deepStrictEqual(failures, []);
