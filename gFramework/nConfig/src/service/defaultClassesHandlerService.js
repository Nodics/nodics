/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');
const fileLoader = require('./defaultFilesLoaderService');

/**
 * @module config/service/DefaultClassesHandlerService
 * @description Loads class exports from active module `src/lib` folders into the global
 * `CLASSES` registry and executes class generalization scripts.
 * @layer service
 * @owner nConfig
 * @override Project modules may add or override classes in later module layers by
 * providing files under `src/lib` or class generalizers in `src/lib/classes.js`.
 *
 * @property {Object} CLASSES Global class registry.
 * @property {Object} fileLoader Layered file loader and recursive file processor.
 */
module.exports = {

    /**
     * Initializes the classes handler service.
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
     * Finalizes the classes handler service.
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
     * Loads class files for all indexed active modules and then runs generalizers.
     *
     * @returns {void}
     * @sideEffects Populates and merges global `CLASSES`.
     */
    loadClasses: function () {
        let _self = this;
        NODICS.getIndexedModules().forEach((value, key) => {
            _self.loadModuleClasses(value);
        });
        _self.generalizeClasses();
    },

    /**
     * Loads class files from one module's `src/lib` directory.
     *
     * @param {Object} module Indexed module object containing module path.
     * @returns {void}
     * @sideEffects Adds or merges class exports into global `CLASSES`.
     */
    loadModuleClasses: function (module) {
        let _self = this;
        let path = module.path + '/src/lib';
        fileLoader.processFiles(path, "*", (file) => {
            if (!file.endsWith('classes.js')) {
                let className = UTILS.getFileNameWithoutExtension(file);
                if (CLASSES[className]) {
                    CLASSES[className] = _.merge(CLASSES[className], require(file));
                } else {
                    CLASSES[className] = require(file);
                }
            }
        }, 'classes.js');
    },

    /**
     * Executes layered class generalization scripts.
     *
     * @returns {void}
     * @sideEffects Runs methods exported from merged `src/lib/classes.js` files.
     */
    generalizeClasses: function () {
        let _self = this;
        let classesScripts = {};
        _self.LOG.debug('Generalizing defined classes');
        fileLoader.loadFiles('/src/lib/classes.js', classesScripts);
        var methods = UTILS.getAllMethods(classesScripts);
        methods.forEach(function (instance) {
            classesScripts[instance]();
        });
    }
};
