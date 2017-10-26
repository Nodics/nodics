const _ = require('lodash');
const fs = require('fs');

module.exports = {

    loadPreScripts: function() {
        console.log('=> Starting Pre Scripts loader process');
        let mergedFile = SYSTEM.loadFiles(CONFIG.getProperties(), '/config/prescripts.js');
        var commonScriptFilePath = CONFIG.get('SERVER_PATH') + '/config/common/prescripts.js';
        var envScriptFilePath = CONFIG.get('SERVER_PATH') + '/config/env-' + CONFIG.get('NODICS_ENV') + '/prescripts.js';
        if (fs.existsSync(commonScriptFilePath)) {
            console.info("   INFO: Loading script file from : " + commonScriptFilePath);
            mergedFile = _.merge(mergedFile, require(commonScriptFilePath));
        }
        if (fs.existsSync(envScriptFilePath)) {
            console.info("   INFO: Loading script file from : " + envScriptFilePath);
            mergedFile = _.merge(mergedFile, require(envScriptFilePath));
        }
        return mergedFile;
    },

    loadPostScripts: function() {
        console.log('=> Starting Post Scripts loader process');
        let mergedFile = SYSTEM.loadFiles(CONFIG.getProperties(), '/config/postscripts.js');
        var commonScriptFilePath = CONFIG.get('SERVER_PATH') + '/config/common/postscripts.js';
        var envScriptFilePath = CONFIG.get('SERVER_PATH') + '/config/env-' + CONFIG.get('NODICS_ENV') + '/postscripts.js';
        if (fs.existsSync(commonScriptFilePath)) {
            console.info("   INFO: Loading file from : " + commonScriptFilePath);
            mergedFile = _.merge(mergedFile, require(commonScriptFilePath));
        }
        if (fs.existsSync(envScriptFilePath)) {
            console.info("   INFO: Loading file from : " + envScriptFilePath);
            mergedFile = _.merge(mergedFile, require(envScriptFilePath));
        }
        return mergedFile;
    },

    executePreScripts: function() {
        var preScripts = this.loadPreScripts();
        console.log("=> Starting pre-script execution process");
        var methods = SYSTEM.getAllMethods(preScripts);
        methods.forEach(function(instance) {
            preScripts[instance]();
        });
        console.log("   INFO: pre-script executed successfully");
    },

    executePostScripts: function() {
        var postScripts = this.loadPostScripts();
        console.log("=> Starting post-script execution process");
        var methods = SYSTEM.getAllMethods(postScripts);
        methods.forEach(function(instance) {
            postScripts[instance]();
        });
        console.log("   INFO: post-script executed successfully");
    }
};