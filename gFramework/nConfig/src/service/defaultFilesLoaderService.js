
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
            var filePath = value.path + fileName;
            if (fs.existsSync(filePath)) {
                _self.LOG.debug('Loading file from : ' + filePath.replace(NODICS.getNodicsHome(), '.'));
                var commonPropertyFile = require(filePath);
                mergedFile = _.merge(mergedFile, commonPropertyFile);
            }
        });
        return mergedFile;
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
