const assert = require('assert');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../../../../');
const dataTypes = ['init', 'core', 'sample'];

function subFolders(folder) {
    return fs.readdirSync(folder)
        .filter(subFolder => fs.statSync(path.join(folder, subFolder)).isDirectory())
        .filter(subFolder => subFolder !== 'node_modules' && subFolder !== 'templates' && subFolder[0] !== '.')
        .map(subFolder => path.join(folder, subFolder));
}

function collectRawModules(folder, modulesList = {}, parent) {
    let moduleName = null;
    let metaDataPath = path.join(folder, 'package.json');
    if (fs.existsSync(metaDataPath)) {
        let metaData = require(metaDataPath);
        let nodics = metaData.nodics || {};
        if (nodics.kind && metaData.runtimeModule !== false && nodics.runtimeModule !== false && nodics.loadableByNodicsModuleLoader !== false) {
            modulesList[metaData.name] = {
                name: metaData.name,
                path: folder,
                index: metaData.index,
                parent: parent,
                metaData: metaData
            };
            moduleName = metaData.name;
            parent = metaData.name;
        }
    }
    let modules = [];
    subFolders(folder).forEach(subFolder => {
        let childModuleName = collectRawModules(subFolder, modulesList, parent);
        if (childModuleName) {
            modules.push(childModuleName);
        }
    });
    if (moduleName && modules.length > 0) {
        modulesList[moduleName].modules = modules;
    }
    return moduleName ? moduleName : null;
}

function loadProperties(moduleObject) {
    let propertiesFile = path.join(moduleObject.path, 'config', 'properties.js');
    return fs.existsSync(propertiesFile) ? require(propertiesFile) : {};
}

function pushUnique(list, value) {
    if (!list.includes(value)) {
        list.push(value);
    }
}

function prepareActiveModuleList(props, rawModules, groupName, modulesList) {
    if (!groupName) {
        return;
    }
    let moduleName = groupName;
    let metaGroupName = null;
    if (moduleName.indexOf(':') > 0) {
        metaGroupName = moduleName.substring(moduleName.indexOf(':') + 1);
        moduleName = moduleName.substring(0, moduleName.indexOf(':'));
    }
    if (modulesList.includes(moduleName)) {
        return;
    }
    let moduleObject = rawModules[moduleName];
    assert(moduleObject, 'Invalid initialization, could not load module: ' + moduleName);
    if (moduleName === 'dynamo' && !props.dynamoEnabled) {
        return;
    }
    let runtime = (moduleObject.metaData.nodics && moduleObject.metaData.nodics.runtime) || {};
    let kind = moduleObject.metaData.nodics && moduleObject.metaData.nodics.kind;
    if (runtime.publish === true && props.publishEnabled) {
        modulesList.push(moduleName);
    } else if (runtime.web === true && props.webEnabled) {
        modulesList.push(moduleName);
    } else if (runtime.publish !== true && runtime.web !== true &&
        ['application', 'capability', 'environment', 'group', 'node', 'server', 'template'].includes(kind)) {
        modulesList.push(moduleName);
    }
    if (metaGroupName) {
        (moduleObject.metaData[metaGroupName] || []).forEach(element => {
            pushUnique(modulesList, element);
        });
    } else if (moduleObject.modules && moduleObject.modules.length > 0) {
        moduleObject.modules.forEach(childModuleName => {
            prepareActiveModuleList(props, rawModules, childModuleName, modulesList);
        });
    }
}

function resolveModuleHierarchy(rawModules, moduleName, environment) {
    let moduleObject = rawModules[moduleName];
    assert(moduleObject, 'Invalid module name: ' + moduleName);
    let modules = [moduleName];
    if (!moduleObject.parent) {
        return modules;
    }
    if (moduleName === environment.name || environment.path.includes(moduleObject.path)) {
        return [];
    }
    if (!moduleObject.parentModules) {
        moduleObject.parentModules = resolveModuleHierarchy(rawModules, moduleObject.parent, environment);
    }
    return modules.concat(moduleObject.parentModules);
}

function resolveSubDependency(rawModules, moduleName, dependantModules) {
    let moduleObject = rawModules[moduleName];
    assert(moduleObject, 'Invalid module name: ' + moduleName);
    (moduleObject.metaData.requiredModules || []).forEach(requiredModuleName => {
        pushUnique(dependantModules, requiredModuleName);
        resolveSubDependency(rawModules, requiredModuleName, dependantModules);
    });
}

function resolveParentDependency(rawModules, moduleName, dependantModules) {
    let moduleObject = rawModules[moduleName];
    assert(moduleObject, 'Invalid module name: ' + moduleName);
    (moduleObject.parentModules || []).forEach(parentModuleName => {
        pushUnique(dependantModules, parentModuleName);
        resolveParentDependency(rawModules, parentModuleName, dependantModules);
    });
}

function getDefaultServerName() {
    let env = require(path.join(repoRoot, 'env.js'));
    return env.defaultOptions.defaultServer || 'kickoffLocalServer';
}

function getDefaultServerActiveModules(rawModules) {
    let serverName = getDefaultServerName();
    let server = rawModules[serverName];
    assert(server, 'Could not find default server module: ' + serverName);
    let serverRoot = rawModules[server.parent];
    let environment = rawModules[serverRoot.parent];
    let serverProperties = {};
    serverProperties = _.merge(serverProperties, loadProperties(environment));
    serverProperties = _.merge(serverProperties, loadProperties(serverRoot));
    serverProperties = _.merge(serverProperties, loadProperties(server));
    let modules = [];
    let moduleGroups = ['gFramework'].concat(serverProperties.activeModules ? serverProperties.activeModules.groups || [] : []);
    moduleGroups.forEach(groupName => {
        prepareActiveModuleList(serverProperties, rawModules, groupName, modules);
    });
    (serverProperties.activeModules.modules || []).forEach(moduleName => {
        pushUnique(modules, moduleName);
    });
    modules.forEach(moduleName => {
        resolveModuleHierarchy(rawModules, moduleName, environment);
    });
    let dependantModules = [];
    modules.forEach(moduleName => {
        resolveSubDependency(rawModules, moduleName, dependantModules);
        resolveParentDependency(rawModules, moduleName, dependantModules);
    });
    dependantModules.forEach(moduleName => {
        pushUnique(modules, moduleName);
    });
    return modules.map(moduleName => rawModules[moduleName]).filter(Boolean);
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
let rawModules = {};
collectRawModules(repoRoot, rawModules);
let activeModules = getDefaultServerActiveModules(rawModules);
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
