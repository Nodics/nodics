/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
const fileLoader = require('./defaultFilesLoaderService');

module.exports = {

    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    loadClasses: function () {
        let _self = this;
        NODICS.getIndexedModules().forEach((value, key) => {
            _self.loadModuleClasses(value);
        });
        _self.generalizeClasses();
    },

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