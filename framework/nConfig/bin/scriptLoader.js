const _ = require('lodash');
const fs = require('fs');

module.exports = {

    loadPreScripts: function() {
        console.log('##  Starting Pre Scripts loader process');
        let mergedFile = SYSTEM.loadFiles(CONFIG, '/config/prescripts.js');
        var commonScriptFilePath = CONFIG.SERVER_PATH + '/config/common/prescripts.js';
        var envScriptFilePath = CONFIG.SERVER_PATH + '/config/env-' + CONFIG.NODICS_ENV + '/prescripts.js';
        if (fs.existsSync(commonScriptFilePath)) {
            console.info("+++++  Loading script file from : " + commonScriptFilePath);
            mergedFile = _.merge(mergedFile, require(commonScriptFilePath));
        }
        if (fs.existsSync(envScriptFilePath)) {
            console.info("+++++  Loading script file from : " + envScriptFilePath);
            mergedFile = _.merge(mergedFile, require(envScriptFilePath));
        }
        return mergedFile;
    },

    loadPostScripts: function() {
        console.log('##  Starting Post Scripts loader process');
        let mergedFile = SYSTEM.loadFiles(CONFIG, '/config/postscripts.js');
        var commonScriptFilePath = CONFIG.SERVER_PATH + '/config/common/postscripts.js';
        var envScriptFilePath = CONFIG.SERVER_PATH + '/config/env-' + CONFIG.NODICS_ENV + '/postscripts.js';
        if (fs.existsSync(commonScriptFilePath)) {
            console.info("+++++  Loading file from : " + commonScriptFilePath);
            mergedFile = _.merge(mergedFile, require(commonScriptFilePath));
        }
        if (fs.existsSync(envScriptFilePath)) {
            console.info("+++++  Loading file from : " + envScriptFilePath);
            mergedFile = _.merge(mergedFile, require(envScriptFilePath));
        }

        return mergedFile;
    },

    executePreScripts: function() {
        var preScripts = this.loadPreScripts();
        var methods = SYSTEM.getAllMethods(preScripts);
        methods.forEach(function(instance) {
            preScripts[instance]();
        });
    },

    executePostScripts: function() {
        var postScripts = this.loadPostScripts();
        var methods = SYSTEM.getAllMethods(postScripts);
        methods.forEach(function(instance) {
            postScripts[instance]();
        })
    }
}