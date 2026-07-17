/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

/**
 * @module config/service/DefaultFilesLoaderService
 * @description Layer-aware file loading utility. It loads and merges matching files
 * from indexed active modules and recursively processes artifact directories for the
 * dynamic service, facade, controller, class, router, pipeline, and schema loaders.
 * @layer service
 * @owner nConfig
 * @override Project modules usually extend behavior by contributing files to expected
 * locations. Replacing this service changes a core layering contract and should preserve
 * deterministic module index order.
 *
 * @property {Object} NODICS Runtime registry for indexed module order and home path.
 */
module.exports = {
    /**
     * Initializes the files loader service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the files loader service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Loads and merges a module-relative file from every indexed active module.
     *
     * @param {string} fileName Module-relative file path.
     * @param {Object} [frameworkFile] Existing object to merge into.
     * @returns {Object} Merged file exports.
     * @sideEffects Requires matching files in module index order.
     */
    loadFiles: function (fileName, frameworkFile) {
        let _self = this;
        let mergedFile = frameworkFile || {};
        NODICS.getIndexedModules().forEach(function (value, key) {
            _self.getCompatibleFileNames(fileName).forEach(compatibleFileName => {
                var filePath = value.path + compatibleFileName;
                if (fs.existsSync(filePath)) {
                    _self.LOG.debug('Loading file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                    var commonPropertyFile = require(filePath);
                    mergedFile = _.merge(mergedFile, commonPropertyFile);
                }
            });
        });
        return mergedFile;
    },

    /**
     * Resolves canonical and compatibility registry paths for generic file loading.
     *
     * @param {string} fileName Requested module-relative file path.
     * @returns {string[]} File paths to load in precedence order.
     */
    getCompatibleFileNames: function (fileName) {
        if (fileName === '/src/pipelines/pipelinesDefinition.js') {
            return ['/src/pipelines/pipelinesDefinition.js', '/src/pipelines/pipelines.js'];
        }
        if (fileName === '/src/pipelines/pipelines.js') {
            return ['/src/pipelines/pipelinesDefinition.js', '/src/pipelines/pipelines.js'];
        }
        return [fileName];
    },

    /**
     * Loads governed files from every active module using a reusable merge policy.
     *
     * @param {string} fileName Module-relative file path.
     * @param {Object} [frameworkFile] Existing effective registry.
     * @param {Object} policy Layer-specific governance policy.
     * @returns {Object} Effective governed registry.
     */
    loadGovernedFiles: function (fileName, frameworkFile, policy) {
        let _self = this;
        let mergedFile = frameworkFile || {};
        NODICS.getIndexedModules().forEach(function (value, key) {
            var filePath = value.path + fileName;
            if (fs.existsSync(filePath)) {
                _self.LOG.debug('Loading ' + policy.label + ' file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                mergedFile = _self.mergeGovernedFile({
                    mergedFile: mergedFile,
                    incomingFile: require(filePath),
                    sourceModule: value.name,
                    filePath: filePath,
                    policy: policy
                });
            }
        });
        return mergedFile;
    },

    /**
     * Merges one governed file into an effective registry.
     *
     * @param {Object} options Merge request.
     * @returns {Object} Updated effective registry.
     */
    mergeGovernedFile: function (options) {
        let _self = this;
        let mergedFile = options.mergedFile || {};
        Object.keys(options.incomingFile || {}).forEach(moduleName => {
            mergedFile[moduleName] = mergedFile[moduleName] || {};
            Object.keys(options.incomingFile[moduleName] || {}).forEach(itemName => {
                if (options.policy.grouped) {
                    mergedFile[moduleName][itemName] = _self.mergeGovernedGroup({
                        existingGroup: mergedFile[moduleName][itemName],
                        incomingGroup: options.incomingFile[moduleName][itemName],
                        moduleName: moduleName,
                        groupName: itemName,
                        sourceModule: options.sourceModule,
                        filePath: options.filePath,
                        source: options.source,
                        policy: options.policy
                    });
                } else {
                    mergedFile[moduleName][itemName] = _self.mergeGovernedItem({
                        existingItem: mergedFile[moduleName][itemName],
                        incomingItem: options.incomingFile[moduleName][itemName],
                        moduleName: moduleName,
                        itemName: itemName,
                        sourceModule: options.sourceModule,
                        filePath: options.filePath,
                        source: options.source,
                        policy: options.policy
                    });
                }
            });
        });
        return mergedFile;
    },

    /**
     * Merges a runtime registry contribution using the same governance policy as
     * file-based module layers.
     *
     * @param {Object} frameworkFile Existing effective registry.
     * @param {Object} runtimeFile Runtime registry contribution.
     * @param {Object} policy Layer-specific governance policy.
     * @param {string} sourceModule Runtime source module or owner.
     * @param {string} source Runtime source label.
     * @returns {Object} Updated effective governed registry.
     */
    mergeGovernedRuntimeRegistry: function (frameworkFile, runtimeFile, policy, sourceModule, source) {
        if (!runtimeFile || Object.keys(runtimeFile).length <= 0) {
            return frameworkFile || {};
        }
        return this.mergeGovernedFile({
            mergedFile: frameworkFile || {},
            incomingFile: runtimeFile,
            sourceModule: sourceModule || 'runtime',
            source: source || 'runtime',
            policy: policy
        });
    },

    /**
     * Merges a governed group, such as a router group containing route definitions.
     *
     * @param {Object} options Group merge request.
     * @returns {Object} Effective governed group.
     */
    mergeGovernedGroup: function (options) {
        let existingGroup = options.existingGroup || {};
        let incomingGroup = _.merge({}, options.incomingGroup || {});
        let groupOverride = incomingGroup.$override || {};
        delete incomingGroup.$override;

        let mode = groupOverride.mode || 'merge';
        this.validateGovernedMode(mode, options.policy, options.moduleName + '.' + options.groupName);

        let existingGroupTrace = mode !== 'replace' && existingGroup.xNodics && existingGroup.xNodics.overrideTrace ?
            existingGroup.xNodics.overrideTrace.slice() : [];
        let effectiveGroup = mode === 'replace' ? {} : _.merge({}, existingGroup);
        if (existingGroupTrace.length > 0) {
            this.defineHiddenTraceContainer(effectiveGroup, existingGroupTrace);
        }

        this.applyGovernedRemovals(effectiveGroup, groupOverride[options.policy.groupRemoveKey] || []);
        Object.keys(incomingGroup).forEach(itemName => {
            effectiveGroup[itemName] = this.mergeGovernedItem({
                existingItem: effectiveGroup[itemName],
                incomingItem: incomingGroup[itemName],
                moduleName: options.moduleName,
                groupName: options.groupName,
                itemName: itemName,
                sourceModule: options.sourceModule,
                filePath: options.filePath,
                source: options.source,
                policy: options.policy
            });
        });

        this.applyGovernedTrace(effectiveGroup, {
            moduleName: options.moduleName,
            groupName: options.groupName,
            sourceModule: options.sourceModule,
            mode: mode,
            removedItems: groupOverride[options.policy.groupRemoveKey] || [],
            removeTraceKey: options.policy.groupRemoveTraceKey,
            allowBreakingChanges: !!groupOverride.allowBreakingChanges,
            filePath: options.filePath,
            source: options.source
        }, true);
        return effectiveGroup;
    },

    /**
     * Merges one governed item, such as a schema or route definition.
     *
     * @param {Object} options Item merge request.
     * @returns {Object} Effective governed item.
     */
    mergeGovernedItem: function (options) {
        let existingItem = options.existingItem || {};
        let incomingItem = _.merge({}, options.incomingItem || {});
        let override = incomingItem.$override || {};
        delete incomingItem.$override;

        let mode = override.mode || 'merge';
        this.validateGovernedMode(mode, options.policy, this.createGovernedPath(options));

        let warnings = options.policy.collectWarnings(existingItem, incomingItem, override);
        if (warnings.length > 0 && override.allowBreakingChanges !== true) {
            this.LOG.warn(options.policy.warningPrefix + ' for ' + this.createGovernedPath(options) + ': ' + warnings.join(', '));
        }

        let effectiveItem = mode === 'replace' ? incomingItem : _.merge(_.merge({}, existingItem), incomingItem);
        if (options.policy.itemRemoveKey) {
            options.policy.applyItemRemovals(effectiveItem, override[options.policy.itemRemoveKey] || []);
        }
        this.applyGovernedTrace(effectiveItem, {
            moduleName: options.moduleName,
            groupName: options.groupName,
            itemName: options.itemName,
            itemTraceName: options.policy.itemTraceName,
            sourceModule: options.sourceModule,
            mode: mode,
            removedItems: override[options.policy.itemRemoveKey] || [],
            removeTraceKey: options.policy.itemRemoveTraceKey,
            allowBreakingChanges: !!override.allowBreakingChanges,
            warnings: warnings,
            filePath: options.filePath,
            source: options.source
        });
        return effectiveItem;
    },

    /**
     * Validates a governed merge mode.
     *
     * @param {string} mode Requested mode.
     * @param {Object} policy Layer policy.
     * @param {string} target Target path.
     * @returns {void}
     */
    validateGovernedMode: function (mode, policy, target) {
        if (!['merge', 'replace'].includes(mode)) {
            throw new CLASSES.NodicsError(policy.invalidModeStatusCode, 'Invalid ' + policy.label + ' override mode for: ' + target);
        }
    },

    /**
     * Creates a readable module/group/item path for logs and errors.
     *
     * @param {Object} options Merge request.
     * @returns {string} Path.
     */
    createGovernedPath: function (options) {
        return [options.moduleName, options.groupName, options.itemName].filter(value => value).join('.');
    },

    /**
     * Removes inherited entries from an effective object.
     *
     * @param {Object} target Effective object.
     * @param {string[]} names Entries to remove.
     * @returns {void}
     */
    applyGovernedRemovals: function (target, names) {
        names.forEach(name => {
            delete target[name];
        });
    },

    /**
     * Defines non-enumerable trace metadata for grouped registries.
     *
     * @param {Object} target Effective group.
     * @param {Object[]} trace Existing trace entries.
     * @returns {void}
     */
    defineHiddenTraceContainer: function (target, trace) {
        Object.defineProperty(target, 'xNodics', {
            value: {
                overrideTrace: trace || []
            },
            enumerable: false,
            configurable: true,
            writable: true
        });
    },

    /**
     * Adds source trace metadata to an effective governed object.
     *
     * @param {Object} target Effective object.
     * @param {Object} trace Trace values.
     * @param {boolean} hidden Whether trace metadata should be non-enumerable.
     * @returns {void}
     */
    applyGovernedTrace: function (target, trace, hidden) {
        if (hidden) {
            Object.defineProperty(target, 'xNodics', {
                value: target.xNodics || {},
                enumerable: false,
                configurable: true,
                writable: true
            });
        } else {
            target.xNodics = target.xNodics || {};
        }
        target.xNodics.overrideTrace = target.xNodics.overrideTrace || [];
        let traceEntry = {
            moduleName: trace.moduleName,
            sourceModule: trace.sourceModule,
            mode: trace.mode,
            allowBreakingChanges: !!trace.allowBreakingChanges
        };
        if (trace.filePath) {
            traceEntry.file = trace.filePath.replace(NODICS.getNodicsHome(), '.');
        }
        if (trace.source) {
            traceEntry.source = trace.source;
        }
        if (trace.groupName) {
            traceEntry.groupName = trace.groupName;
        }
        if (trace.itemName && trace.itemTraceName) {
            traceEntry[trace.itemTraceName] = trace.itemName;
        }
        if (trace.removeTraceKey) {
            traceEntry[trace.removeTraceKey] = trace.removedItems || [];
        }
        if (trace.warnings) {
            traceEntry.warnings = trace.warnings;
        }
        target.xNodics.overrideTrace.push(traceEntry);
    },

    /**
     * Creates the governed merge policy for schema definitions.
     *
     * @returns {Object} Schema governance policy.
     */
    getSchemaGovernancePolicy: function () {
        return {
            label: 'schema',
            grouped: false,
            invalidModeStatusCode: 'ERR_DBS_00003',
            warningPrefix: 'Schema override has potential breaking changes',
            itemTraceName: 'schemaName',
            itemRemoveKey: 'removeProperties',
            itemRemoveTraceKey: 'removedProperties',
            collectWarnings: (existingSchema, incomingSchema, override) => {
                let warnings = [];
                let existingDefinition = existingSchema.definition || {};
                let incomingDefinition = incomingSchema.definition || {};
                Object.keys(incomingDefinition).forEach(propertyName => {
                    let existingProperty = existingDefinition[propertyName];
                    let incomingProperty = incomingDefinition[propertyName];
                    if (existingProperty && incomingProperty) {
                        if (existingProperty.type && incomingProperty.type && existingProperty.type !== incomingProperty.type) {
                            warnings.push('property type changed: ' + propertyName);
                        }
                        if (incomingProperty.required !== undefined && existingProperty.required !== incomingProperty.required) {
                            warnings.push('required flag changed: ' + propertyName);
                        }
                    }
                });
                if ((override.removeProperties || []).length > 0) {
                    warnings.push('properties removed: ' + override.removeProperties.join(', '));
                }
                return warnings;
            },
            applyItemRemovals: (schema, removeProperties) => {
                removeProperties.forEach(propertyName => {
                    if (schema.definition) {
                        delete schema.definition[propertyName];
                    }
                });
            }
        };
    },

    /**
     * Creates the governed merge policy for router definitions.
     *
     * @returns {Object} Router governance policy.
     */
    getRouterGovernancePolicy: function () {
        return {
            label: 'router',
            grouped: true,
            invalidModeStatusCode: 'ERR_RTR_00003',
            warningPrefix: 'Router override has potential breaking changes',
            groupRemoveKey: 'removeRoutes',
            groupRemoveTraceKey: 'removedRoutes',
            itemTraceName: 'routeName',
            collectWarnings: (existingRoute, incomingRoute) => {
                let warnings = [];
                ['key', 'method', 'controller', 'operation', 'secured'].forEach(propertyName => {
                    if (existingRoute[propertyName] !== undefined &&
                        incomingRoute[propertyName] !== undefined &&
                        !_.isEqual(existingRoute[propertyName], incomingRoute[propertyName])) {
                        warnings.push(propertyName + ' changed');
                    }
                });
                if (existingRoute.accessGroups !== undefined &&
                    incomingRoute.accessGroups !== undefined &&
                    !_.isEqual(existingRoute.accessGroups, incomingRoute.accessGroups)) {
                    warnings.push('accessGroups changed');
                }
                return warnings;
            }
        };
    },

    /**
     * Loads router definitions with explicit route override governance.
     *
     * @param {string} fileName Module-relative router file path.
     * @param {Object} [frameworkFile] Existing router registry to merge into.
     * @returns {Object} Effective router registry.
     */
    loadRouterFiles: function (fileName, frameworkFile) {
        let mergedRouters = frameworkFile || {};
        let _self = this;
        let policy = this.getRouterGovernancePolicy();
        NODICS.getIndexedModules().forEach(function (value, key) {
            _self.getRouterRegistryFileNames(fileName).forEach(routerFileName => {
                let filePath = value.path + routerFileName;
                if (fs.existsSync(filePath)) {
                    _self.LOG.debug('Loading ' + policy.label + ' file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                    mergedRouters = _self.mergeGovernedFile({
                        mergedFile: mergedRouters,
                        incomingFile: require(filePath),
                        sourceModule: value.name,
                        filePath: filePath,
                        policy: policy
                    });
                }
            });
        });
        return mergedRouters;
    },

    /**
     * Resolves canonical and compatibility router registry paths.
     *
     * @param {string} fileName Requested router registry path.
     * @returns {string[]} Router registry paths to load in precedence order.
     */
    getRouterRegistryFileNames: function (fileName) {
        if (fileName === '/src/router/router.js') {
            return ['/src/router/router.js', '/src/router/routers.js'];
        }
        if (fileName === '/src/router/routers.js') {
            return ['/src/router/router.js', '/src/router/routers.js'];
        }
        return [fileName];
    },

    /**
     * Merges runtime router definitions with explicit route override governance.
     *
     * @param {Object} frameworkFile Existing effective router registry.
     * @param {Object} runtimeFile Runtime router registry contribution.
     * @param {string} [sourceModule] Runtime source module or owner.
     * @param {string} [source] Runtime source label.
     * @returns {Object} Effective router registry.
     */
    mergeRuntimeRouterFiles: function (frameworkFile, runtimeFile, sourceModule, source) {
        return this.mergeGovernedRuntimeRegistry(
            frameworkFile,
            runtimeFile,
            this.getRouterGovernancePolicy(),
            sourceModule,
            source || 'runtime:routerConfiguration'
        );
    },

    /**
     * Loads schema definitions with explicit enterprise override governance.
     *
     * Normal schema fragments are still additive and developer-friendly. Later
     * modules may use `$override` metadata for intentional replace, property
     * removal, and breaking-change declaration. This method is schema-specific so
     * the generic file loader contract remains unchanged for routers, config, and
     * status definitions.
     *
     * Supported schema metadata:
     * - `$override.mode`: `merge` (default) or `replace`.
     * - `$override.removeProperties`: definition properties to remove.
     * - `$override.allowBreakingChanges`: set to `true` when a type/required change is intentional.
     *
     * @param {string} fileName Module-relative schema file path.
     * @param {Object} [frameworkFile] Existing schema registry to merge into.
     * @returns {Object} Effective schema registry.
     */
    loadSchemaFiles: function (fileName, frameworkFile) {
        return this.loadGovernedFiles(fileName, frameworkFile, this.getSchemaGovernancePolicy());
    },

    /**
     * Merges runtime schema definitions with explicit schema override governance.
     *
     * @param {Object} frameworkFile Existing effective schema registry.
     * @param {Object} runtimeFile Runtime schema registry contribution.
     * @param {string} [sourceModule] Runtime source module or owner.
     * @param {string} [source] Runtime source label.
     * @returns {Object} Effective schema registry.
     */
    mergeRuntimeSchemaFiles: function (frameworkFile, runtimeFile, sourceModule, source) {
        return this.mergeGovernedRuntimeRegistry(
            frameworkFile,
            runtimeFile,
            this.getSchemaGovernancePolicy(),
            sourceModule,
            source || 'runtime:schemaConfiguration'
        );
    },

    /**
     * Recursively processes files under a directory and invokes a callback for matches.
     *
     * @param {string} filePath Directory to traverse.
     * @param {string} filePostFix Required filename suffix, or `*` for every file.
     * @param {Function} callback Callback invoked with each matching file path.
     * @returns {void}
     */
    processFiles: function (filePath, filePostFix, callback) {
        let _self = this;
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.map(function (file) {
                    return path.join(filePath, file);
                }).filter(function (file) {
                    if (fs.statSync(file).isDirectory()) {
                        _self.processFiles(file, filePostFix, callback);
                    } else {
                        return fs.statSync(file).isFile();
                    }
                }).filter(function (file) {
                    if (!filePostFix || filePostFix === '*') {
                        return true;
                    } else {
                        return file.endsWith(filePostFix);
                    }
                }).forEach(function (file) {
                    _self.LOG.debug('Loading file from : ' + file.replace(NODICS.getNodicsHome(), '.'));
                    callback(file);
                });
            }
        }
    },

    /**
     * Records artifact contribution metadata for override diagnostics.
     *
     * @param {Object} artifact Runtime artifact object.
     * @param {Object} options Artifact metadata.
     * @returns {void}
     */
    recordArtifactContribution: function (artifact, options) {
        if (!artifact || typeof artifact !== 'object') {
            return;
        }
        artifact.xNodics = artifact.xNodics || {};
        artifact.xNodics.overrideTrace = artifact.xNodics.overrideTrace || [];
        artifact.xNodics.overrideTrace.push({
            name: options.name,
            layer: options.layer,
            sourceModule: options.sourceModule,
            action: options.action || 'merge',
            file: options.filePath ? options.filePath.replace(NODICS.getNodicsHome(), '.') : undefined
        });
    },

    /**
     * Extracts top-level variable declarations from layered files.
     *
     * This supports generated service/facade/controller builders that need to preserve
     * common variable declarations while generating schema-specific files.
     *
     * @param {string} fileName Module-relative file path.
     * @returns {Object} Map of variable names to declaration text.
     */
    getGlobalVariables: function (fileName) {
        let _self = this;
        let gVar = {};
        NODICS.getIndexedModules().forEach(function (value, key) {
            var filePath = value.path + fileName;
            if (fs.existsSync(filePath)) {
                _self.LOG.debug('Loading file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                fs.readFileSync(filePath).toString().split('\n').forEach((line) => {
                    if (line.startsWith('const') || line.startsWith('let') || line.startsWith('var')) {
                        let value = line.trim().split(' ');
                        if (!gVar[value[1]]) {
                            gVar[value[1]] = {
                                value: line.trim()
                            };
                        }
                    }
                });
            }
        });
        return gVar;
    }
};
