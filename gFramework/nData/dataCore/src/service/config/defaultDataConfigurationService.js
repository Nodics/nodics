/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    importInterceptors: {},
    exportInterceptors: {},

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
            this.LOG.debug('Collecting database middlewares');
            NODICS.setRawModels(SERVICE.DefaultFilesLoaderService.loadFiles('/src/schemas/model.js'));
            resolve(true);
        });
    },

    setImportInterceptors: function (interceptors) {
        this.importInterceptors = interceptors;

    },

    getImportInterceptors: function (moduleName, modelName) {
        //console.log(this.importInterceptors);
        if (!this.importInterceptors[moduleName]) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!this.importInterceptors[moduleName][modelName]) {
            throw new Error('Invalid model name: ' + modelName);
        } else {
            return this.importInterceptors[moduleName][modelName];
        }
    },

    setExportInterceptors: function (interceptors) {
        this.exportInterceptors = interceptors;

    },

    getExportInterceptors: function (moduleName, modelName) {
        if (!this.exportInterceptors[moduleName]) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!this.exportInterceptors[moduleName][modelName]) {
            throw new Error('Invalid model name: ' + modelName);
        } else {
            return this.exportInterceptors[moduleName][modelName];
        }
    }
};