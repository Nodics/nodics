/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const utils = require('../utils/utils');
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

    loadPreScript: function () {
        this.LOG.info('Starting Pre Scripts loader process');
        NODICS.setPreScripts(fileLoader.loadFiles('/config/prescripts.js'));
    },

    loadPostScript: function () {
        this.LOG.info("Starting pre-script execution process");
        NODICS.setPostScripts(fileLoader.loadFiles('/config/postscripts.js'));
    },

    executePreScripts: function () {
        return new Promise((resolve, reject) => {
            try {
                var preScripts = NODICS.getPreScripts();
                var methods = utils.getAllMethods(preScripts);
                methods.forEach(function (instance) {
                    preScripts[instance]();
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    executePostScripts: function () {
        return new Promise((resolve, reject) => {
            try {
                var postScripts = NODICS.getPostScripts();
                var methods = utils.getAllMethods(postScripts);
                methods.forEach(function (instance) {
                    postScripts[instance]();
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }
};