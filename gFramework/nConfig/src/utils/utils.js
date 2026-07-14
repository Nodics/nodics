/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

/**
 * @module config/utils/utils
 * @description Shared nConfig utilities for module discovery, runtime activation, hierarchy traversal, generated artifact creation, filesystem cleanup, and router enablement decisions.
 * @layer utility
 * @owner nConfig
 * @override Later modules may merge additional utility functions through the layered utility loader. Replacements must preserve metadata-driven discovery, module ownership boundaries, effective-schema generation, and clean/build behavior.
 * @property {Object} NODICS Global runtime and module registry.
 * @property {Object} CONFIG Effective layered configuration registry.
 * @property {Object} UTILS Layered utility registry used for recursive and generation calls.
 */
module.exports = {

    /**
     * Determines whether a value is absent or has no enumerable keys.
     * @param {*} value Value to inspect.
     * @returns {boolean} True when the value is empty by the legacy Nodics contract.
     */
    isBlank: function (value) {
        return !value || !Object.keys(value).length;
    },

    /**
     * Sorts dotted hierarchical module indexes numerically.
     * @param {string[]} rawData Module index values.
     * @returns {string[]} Sorted index values.
     */
    sortModules: function (rawData) {
        let indexedData = rawData.map(a => a.split('.').map(n => +n + 100000).join('.')).sort()
            .map(a => a.split('.').map(n => +n - 100000).join('.'));
        return indexedData;
    },

    /**
     * Groups objects by the integer value of a selected property.
     * @param {Object[]} moduleIndex Objects to group.
     * @param {string} property Property containing the grouping value.
     * @returns {Object<string,Object[]>} Grouped objects.
     */
    sortObject: function (moduleIndex, property) {
        moduleIndex = _.groupBy(moduleIndex, function (element) {
            return parseInt(element[property]);
        });
        return moduleIndex;
    },

    /**
     * Expands a configured module or group into the active module list.
     * @param {Object} props Effective startup properties controlling optional runtime kinds.
     * @param {string} groupName Module name, optionally followed by a metadata group selector.
     * @param {string[]} modulesList Mutable active module list.
     * @returns {void}
     * @sideEffects Recursively appends eligible modules and terminates startup for an unknown module.
     */
    prepareActiveModuleList: function (props, groupName, modulesList) {
        if (!groupName) {
            return;
        } else {
            let moduleName = groupName;
            groupName = null;
            if (moduleName.indexOf(':') > 0) {
                groupName = moduleName.substring(moduleName.indexOf(':') + 1, moduleName.length);
                moduleName = moduleName.substring(0, moduleName.indexOf(':'));
            }
            if (!modulesList.includes(moduleName)) {
                let moduleObject = NODICS.getRawModule(moduleName);
                if (!moduleObject) {
                    console.error('Invalid initialization, could not load module: ' + moduleName);
                    process.exit(1);
                }
                if (moduleName === (props.dynamoModuleName || 'dynamo') && !props.dynamoEnabled) {
                    let currentdate = new Date();
                    let datetime = currentdate.getFullYear() + '-' + (currentdate.getMonth() + 1) + '-' + currentdate.getDate() +
                        ' ' + currentdate.getHours() + ':' + currentdate.getMinutes() + ":" + currentdate.getSeconds();
                    console.log(datetime, ' info: [DefaultModuleInitializerService] Dynamo module is not activated');
                } else if (this.isPublishModule(moduleObject.metaData) && props.publishEnabled) {
                    modulesList.push(moduleName);
                } else if (this.isAlwaysLoadableModule(moduleObject.metaData)) {
                    modulesList.push(moduleName);
                }
                if (groupName) {
                    if (moduleObject.metaData[groupName] && moduleObject.metaData[groupName].length > 0) {
                        moduleObject.metaData[groupName].forEach(element => {
                            modulesList.push(element);
                        });
                    }
                } else if (moduleObject.modules && moduleObject.modules.length > 0) {
                    for (let count = 0; count < moduleObject.modules.length; count++) {
                        this.prepareActiveModuleList(props, moduleObject.modules[count], modulesList);
                    }
                }
            }
        }
    },

    /**
     * Returns canonical Nodics metadata from a package manifest.
     * @param {Object} metaData Package metadata.
     * @returns {Object} `package.json.nodics` or an empty object.
     */
    getNodicsMetadata: function (metaData) {
        return metaData && metaData.nodics ? metaData.nodics : {};
    },

    /**
     * Returns the canonical package kind.
     * @param {Object} metaData Package metadata.
     * @returns {string|undefined} Nodics package kind.
     */
    getModuleKind: function (metaData) {
        let nodics = this.getNodicsMetadata(metaData);
        return nodics.kind;
    },

    /**
     * Returns runtime activation flags from canonical package metadata.
     * @param {Object} metaData Package metadata.
     * @returns {Object} Runtime flags.
     */
    getModuleRuntime: function (metaData) {
        let nodics = this.getNodicsMetadata(metaData);
        return nodics.runtime || {};
    },

    /**
     * Checks whether a module declares ownership of an extension area.
     * @param {Object} metaData Package metadata.
     * @param {string} ownership Ownership name.
     * @returns {boolean} True when ownership is declared.
     */
    hasModuleOwnership: function (metaData, ownership) {
        let nodics = this.getNodicsMetadata(metaData);
        return Array.isArray(nodics.owns) && nodics.owns.includes(ownership);
    },

    /**
     * Checks whether a package is activated by the publish runtime.
     * @param {Object} metaData Package metadata.
     * @returns {boolean} Publish activation flag.
     */
    isPublishModule: function (metaData) {
        return this.getModuleRuntime(metaData).publish === true;
    },

    /**
     * Determines whether a non-publish package kind is normally loadable.
     * @param {Object} metaData Package metadata.
     * @returns {boolean} True for supported application, capability, topology, group, or template kinds.
     */
    isAlwaysLoadableModule: function (metaData) {
        let runtime = this.getModuleRuntime(metaData);
        if (runtime.publish === true) {
            return false;
        }
        let moduleKind = this.getModuleKind(metaData);
        return [
            'application',
            'capability',
            'environment',
            'group',
            'node',
            'server',
            'template'
        ].includes(moduleKind);
    },

    /**
     * Discovers runtime modules under a Nodics home and registers them in `NODICS`.
     * @param {string} homePath Repository or application root.
     * @returns {void}
     * @sideEffects Populates the raw module registry.
     */
    loadRawModuleList: function (homePath) {
        let modulesList = {};
        this.collectModulesList(homePath, modulesList);
        // Object.keys(modulesList).forEach(moduleName => {
        //     this.resolveModuleHierarchy(moduleName, modulesList);
        // });
        if (modulesList && !this.isBlank(modulesList)) {
            NODICS.addRawModules(modulesList);
        }
    },

    /**
     * Lists traversable child directories while excluding dependencies, templates, and hidden folders.
     * @param {string} folder Parent directory.
     * @returns {string[]} Absolute child directory paths.
     */
    subFolders: function (folder) {
        return fs.readdirSync(folder)
            .filter(subFolder => fs.statSync(path.join(folder, subFolder)).isDirectory())
            .filter(subFolder => subFolder !== 'node_modules' && subFolder !== 'templates' && subFolder !== 'docs' && subFolder[0] !== '.')
            .map(subFolder => path.join(folder, subFolder));
    },

    /**
     * Recursively discovers canonical runtime packages and records parent-child ownership.
     * @param {string} folder Directory to inspect.
     * @param {Object<string,Object>} modulesList Mutable discovery result.
     * @param {string} [parent] Parent runtime module name.
     * @returns {string|null} Discovered module name for the current directory.
     */
    collectModulesList: function (folder, modulesList, parent) {
        let moduleName = null;
        let metaDataPath = path.join(folder, 'package.json');
        if (fs.existsSync(metaDataPath)) {
            let metaData = require(metaDataPath);
            if (this.isRuntimeModule(metaData)) {
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
        for (let subFolder of this.subFolders(folder)) {
            let moduleName = this.collectModulesList(subFolder, modulesList, parent);
            if (moduleName) {
                modules.push(moduleName);
            }
        }
        if (moduleName && modules.length > 0) {
            modulesList[moduleName].modules = modules;
        }
        return moduleName ? moduleName : null;
    },

    /**
     * Determines whether package metadata represents a Nodics runtime module.
     * @param {Object} metaData Package metadata.
     * @returns {boolean} True when canonical kind and loader flags permit activation.
     */
    isRuntimeModule: function (metaData) {
        if (!metaData) {
            return false;
        }
        let nodics = this.getNodicsMetadata(metaData);
        if (!nodics.kind) {
            return false;
        }
        if (metaData.runtimeModule === false) {
            return false;
        }
        if (nodics.runtimeModule === false || nodics.loadableByNodicsModuleLoader === false) {
            return false;
        }
        return true;
    },

    /**
     * Resolves a discovered module and its full parent hierarchy recursively.
     *
     * This utility is for raw package discovery and diagnostics. Active runtime
     * module expansion uses `DefaultFrameworkInitializerService.resolveModuleHierarchy`
     * because selected environment boundaries must be respected during startup.
     * @param {string} moduleName Module to resolve.
     * @param {Object<string,Object>} modulesList Discovered modules.
     * @returns {string[]} Module followed by parent module names.
     */
    resolveModuleHierarchy: function (moduleName, modulesList) {
        let moduleObject = modulesList[moduleName];
        let modules = [moduleName];
        if (moduleObject.parent) {
            if (!moduleObject.parentModules) {
                moduleObject.parentModules = this.resolveModuleHierarchy(moduleObject.parent, modulesList);
            }
            modules = modules.concat(moduleObject.parentModules);
        }
        return modules;
    },

    /** Backward-compatible alias for legacy callers. */
    resolveModuleHiererchy: function (moduleName, modulesList) {
        return this.resolveModuleHierarchy(moduleName, modulesList);
    },

    /**
     * Returns own function-valued properties from a script contribution.
     * @param {Object} envScripts Script export object.
     * @returns {string[]} Function property names.
     */
    getAllMethods: function (envScripts) {
        return Object.getOwnPropertyNames(envScripts).filter(function (prop) {
            return typeof envScripts[prop] == 'function';
        });
    },

    /**
     * Converts a file basename to the generated Nodics class-name convention.
     * @param {string} filePath File path with extension.
     * @returns {string} Upper-camelized basename.
     */
    getFileNameWithoutExtension: function (filePath) {
        let fileName = filePath.substring(filePath.lastIndexOf("/") + 1, filePath.lastIndexOf("."));
        return fileName.toUpperCaseFirstChar();
    },

    /**
     * Recursively removes a directory and its contents.
     * @param {string} path Directory to remove.
     * @returns {void}
     * @sideEffects Deletes files and directories from disk.
     */
    removeDir: function (path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    UTILS.removeDir(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    },

    /**
     * Walks effective module schemas and schedules generation for enabled service or router artifacts.
     * @param {Object} options Generation options including `currentDir`, `type`, templates, and postfix.
     * @returns {Promise<boolean|Array>} Resolves after all eligible schema artifacts are generated.
     * @sideEffects Creates the target directory and mutates generation context for each schema.
     */
    schemaWalkThrough: function (options) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(options.currentDir)) {
                fs.mkdirSync(options.currentDir);
            }
            let allPromise = [];
            _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                if (moduleObject.rawSchema) {
                    _.each(moduleObject.rawSchema, (schemaObject, schemaName) => {
                        if ((options.type === 'service' && schemaObject.service && schemaObject.service.enabled) ||
                            (options.type === 'router' && schemaObject.router && schemaObject.router.enabled)) {
                            options.moduleName = moduleName;
                            options.moduleObject = moduleObject;
                            options.schemaName = schemaName;
                            options.schemaObject = schemaObject;
                            allPromise.push(UTILS.createObject(options));
                        }
                    });
                }
            });
            if (allPromise.length > 0) {
                Promise.all(allPromise).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    /**
     * Creates one schema-driven artifact from the common definition template.
     * @param {Object} options Effective schema and generation context.
     * @returns {Promise<boolean>} Resolves after writing the generated file or when no model is required.
     * @sideEffects Writes a generated JavaScript file beneath the current artifact directory.
     */
    createObject: function (options) {
        return new Promise((resolve, reject) => {
            options.modelName = options.schemaName.toUpperCaseEachWord();
            if (options.schemaObject.model) {
                let entityName = options.modelName + options.postFix;
                let fileName = options.currentDir + '/Default' + entityName + '.js';
                let data = UTILS.getCopywriteComment();
                data += UTILS.getGeneratedDocumentation(options, entityName);
                if (!UTILS.isBlank(options.gVar)) {
                    _.each(options.gVar, (value, key) => {
                        data = data + value.value + '\n';
                    });
                    data = data + '\n';
                }
                data = data + 'module.exports = ' + UTILS.replacePlaceholders(options).replace(/\\n/gm, '\n').replaceAll("\"", "") + ';';
                fs.writeFile(fileName,
                    data,
                    'utf-8',
                    function (error, success) {
                        if (error) {
                            UTILS.LOG.error('While creating object for file : ' + fileName.replace(NODICS.getNodicsHome(), '.'), ' : ', error);
                            reject(error);
                        } else {
                            UTILS.LOG.debug('Creating class object for : ' + fileName.replace(NODICS.getNodicsHome() + '.'));
                            resolve(true);
                        }
                    });
            } else {
                resolve(true);
            }
        });
    },

    /**
     * Returns the standard Nodics copyright header used by generated JavaScript files.
     * @returns {string} Generated source header.
     */
    getCopywriteComment: function () {
        return '/*\n' +
            '    Nodics - Enterprice Micro-Services Management Framework\n' +
            '\n' +
            '    Copyright (c) 2017 Nodics All rights reserved.\n' +
            '\n' +
            '    This software is the confidential and proprietary information of Nodics ("Confidential Information").\n' +
            '    You shall not disclose such Confidential Information and shall use it only in accordance with the\n' +
            '    terms of the license agreement you entered into with Nodics.\n' +
            '\n' +
            ' */\n';
    },

    /**
     * Builds the standard generated-file documentation header.
     *
     * @param {Object} options Generation options from schema walk-through.
     * @param {string} entityName Generated entity name without `Default` prefix.
     * @returns {string} JSDoc block marking the artifact as generated.
     */
    getGeneratedDocumentation: function (options, entityName) {
        let artifactType = options.postFix ? options.postFix.toLowerCase() : 'artifact';
        let layer = artifactType === 'controller' ? 'controller' : artifactType === 'facade' ? 'facade' : 'service';
        let owner = options.moduleName || 'unknown';
        let schemaCode = options.schemaName || 'unknown';
        let schemaModel = options.modelName ? options.modelName + 'Model' : 'unknown';
        let generatedName = 'Default' + entityName;
        return '/**\n' +
            ' * @generated\n' +
            ' * @module generated/' + layer + '/' + generatedName + '\n' +
            ' * @description Generated ' + layer + ' for schema `' + schemaCode + '` owned by module `' + owner + '`. This file is recreated by clean/build from the effective schema and common ' + layer + ' template.\n' +
            ' * @layer ' + layer + '\n' +
            ' * @owner ' + owner + '\n' +
            ' * @schema ' + schemaCode + '\n' +
            ' * @model ' + schemaModel + '\n' +
            ' * @sourceTemplate /src/' + layer + '/common.js\n' +
            ' * @override Do not edit generated files directly. Customize behavior by adding a later module in the hierarchy that overrides this generated artifact or its source template contract.\n' +
            ' */\n';
    },

    /**
     * Serializes a common artifact template and replaces schema-specific placeholders.
     * @param {Object} options Generation options and common definition object.
     * @returns {string} JavaScript object source with module, model, schema, service, facade, controller, and context-root substitutions.
     */
    replacePlaceholders: function (options) {
        var commonDefinitionString = JSON.stringify(options.commonDefinition, function (key, value) {
            if (typeof value === 'function') {
                return value.toString();
            } else if (typeof value === 'string') {
                return '\'' + value + '\'';
            } else {
                return value;
            }
        }, 4);
        let contextRoot = CONFIG.get('server').options.contextRoot;
        commonDefinitionString = commonDefinitionString.replaceAll('mdulnm', options.moduleName)
            .replaceAll('mdlnm', options.modelName + 'Model')
            .replaceAll('schmanm', options.schemaName)
            .replaceAll('mdlVar', options.modelName)
            .replaceAll('srvcName', 'Default' + options.modelName + 'Service')
            .replaceAll('dsdName', 'Default' + options.modelName + 'Facade')
            .replaceAll("ctxRoot", contextRoot)
            .replaceAll("ctrlName", 'Default' + options.modelName + 'Controller');
        return commonDefinitionString;
    },

    /**
     * Determines whether API routing is enabled for an active module.
     * @param {string} moduleName Active module name.
     * @returns {boolean} True when router metadata permits routing and optional Dynamo activation is satisfied.
     */
    isRouterEnabled: function (moduleName) {
        let moduleObject = NODICS.getModule(moduleName);
        if (moduleObject &&
            moduleObject.metaData &&
            this.getModuleRuntime(moduleObject.metaData).router === true &&
            (moduleName !== (CONFIG.get('dynamoModuleName') || 'dynamo') || CONFIG.get('dynamoEnabled'))) {
            return true;
        }
        return false;
    }
};
