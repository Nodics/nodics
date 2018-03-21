/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');

module.exports = {

    loadPreScripts: function() {
        SYSTEM.LOG.info('Starting Pre Scripts loader process');
        let mergedFile = SYSTEM.loadFiles('/config/prescripts.js');
        var commonScriptFilePath = NODICS.getServerHome() + '/config/common/prescripts.js';
        var envScriptFilePath = NODICS.getServerHome() + '/config/env-' + NODICS.getActiveEnvironment() + '/prescripts.js';
        if (fs.existsSync(commonScriptFilePath)) {
            SYSTEM.LOG.debug("Loading script file from : " + commonScriptFilePath);
            mergedFile = _.merge(mergedFile, require(commonScriptFilePath));
        }
        if (fs.existsSync(envScriptFilePath)) {
            SYSTEM.LOG.debug("Loading script file from : " + envScriptFilePath);
            mergedFile = _.merge(mergedFile, require(envScriptFilePath));
        }
        let commonTenantScriptFilePath = NODICS.getServerHome() + '/config/common/' + NODICS.getActiveTanent() + '-prescripts.js';
        if (fs.existsSync(commonTenantScriptFilePath)) {
            SYSTEM.LOG.debug("Loading script file from : " + commonTenantScriptFilePath);
            mergedFile = _.merge(mergedFile, require(commonTenantScriptFilePath));
        }
        var envTenantScriptFilePath = NODICS.getServerHome() + '/config/env-' + NODICS.getActiveEnvironment() + '/' + NODICS.getActiveTanent() + '-prescripts.js';
        if (fs.existsSync(envTenantScriptFilePath)) {
            SYSTEM.LOG.debug("Loading script file from : " + envTenantScriptFilePath);
            mergedFile = _.merge(mergedFile, require(envTenantScriptFilePath));
        }
        return mergedFile;
    },

    loadPostScripts: function() {
        SYSTEM.LOG.info('Starting Post Scripts loader process');
        let mergedFile = SYSTEM.loadFiles('/config/postscripts.js');
        var commonScriptFilePath = NODICS.getServerHome() + '/config/common/postscripts.js';
        var envScriptFilePath = NODICS.getServerHome() + '/config/env-' + NODICS.getActiveEnvironment() + '/postscripts.js';
        if (fs.existsSync(commonScriptFilePath)) {
            SYSTEM.LOG.debug("Loading file from : " + commonScriptFilePath.replace(NODICS.getNodicsHome(), '.'));
            mergedFile = _.merge(mergedFile, require(commonScriptFilePath));
        }
        if (fs.existsSync(envScriptFilePath)) {
            SYSTEM.LOG.debug("Loading file from : " + envScriptFilePath.replace(NODICS.getNodicsHome(), '.'));
            mergedFile = _.merge(mergedFile, require(envScriptFilePath));
        }

        let commonTenantScriptFilePath = NODICS.getServerHome() + '/config/common/' + NODICS.getActiveTanent() + '-postscripts.js';
        if (fs.existsSync(commonTenantScriptFilePath)) {
            SYSTEM.LOG.debug("Loading script file from : " + commonTenantScriptFilePath.replace(NODICS.getNodicsHome(), '.'));
            mergedFile = _.merge(mergedFile, require(commonTenantScriptFilePath));
        }
        var envTenantScriptFilePath = NODICS.getServerHome() + '/config/env-' + NODICS.getActiveEnvironment() + '/' + NODICS.getActiveTanent() + '-postscripts.js';
        if (fs.existsSync(envTenantScriptFilePath)) {
            SYSTEM.LOG.debug("Loading script file from : " + envTenantScriptFilePath.replace(NODICS.getNodicsHome(), '.'));
            mergedFile = _.merge(mergedFile, require(envTenantScriptFilePath));
        }
        return mergedFile;
    },

    executePreScripts: function() {
        var preScripts = this.loadPreScripts();
        SYSTEM.LOG.info("Starting pre-script execution process");
        var methods = SYSTEM.getAllMethods(preScripts);
        methods.forEach(function(instance) {
            preScripts[instance]();
        });
        SYSTEM.LOG.info("Pre-Script executed successfully");
    },

    executePostScripts: function() {
        var postScripts = this.loadPostScripts();
        SYSTEM.LOG.info("Starting post-script execution process");
        var methods = SYSTEM.getAllMethods(postScripts);
        methods.forEach(function(instance) {
            postScripts[instance]();
        });
        SYSTEM.LOG.info("Post-Script executed successfully");
    }
};