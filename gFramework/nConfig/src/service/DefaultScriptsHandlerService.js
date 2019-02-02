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

    loadPreScript: function () {
        this.LOG.info('Starting Pre Scripts loader process');
        NODICS.setPreScripts(fileLoader.loadFiles('/config/prescripts.js'));
    },

    loadPostScript: function () {
        this.LOG.info("Starting pre-script execution process");
        NODICS.setPostScripts(fileLoader.loadFiles('/config/postscripts.js'));
    },

    executePreScripts: function () {
        var preScripts = NODICS.getPreScripts();
        var methods = utils.getAllMethods(preScripts);
        methods.forEach(function (instance) {
            preScripts[instance]();
        });
    },

    executePostScripts: function () {
        var postScripts = NODICS.getPostScripts();
        var methods = utils.getAllMethods(postScripts);
        methods.forEach(function (instance) {
            postScripts[instance]();
        });
    }
};