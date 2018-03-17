/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const propertyLoader = require('./bin/propertyLoader');
const systemLoader = require('./bin/systemLoader');
const scriptLoader = require('./bin/scriptLoader');
const sys = require('./bin/system');

module.exports = {
    init: function() {

    },

    loadConfig: function(options) {
        let startTime = new Date();
        sys.prepareOptions(options);
        if (!NODICS) {
            sys.LOG.error("    ERROR: System initialization error: options cann't be null or empty");
            process.exit(1);
        }
        sys.LOG.info('=>Initializing Nodics, Node based enterprise application solution   ###');
        sys.LOG.info('---------------------------------------------------------------------------');
        sys.LOG.info('SERVER_PATH : ', NODICS.getServerHome());
        sys.LOG.info('NODICS_HOME : ', NODICS.getNodicsHome());
        sys.LOG.info('NODICS_APP  : ', NODICS.getActiveApplication());
        sys.LOG.info('NODICS_ENV  : ', NODICS.getActiveEnvironment());
        sys.LOG.info('---------------------------------------------------------------------------');
        propertyLoader.init();
        NODICS.setStartTime(startTime);
        NODICS.setActiveTanent(CONFIG.get('activeTanent'));
        sys.LOG.info("   INFO: Starting Nodics with active tenant : ", CONFIG.get('activeTanent'));
        systemLoader.init();
        SYSTEM.LOG = SYSTEM.createLogger('SYSTEM');
        NODICS.LOG = SYSTEM.createLogger('NODICS');
        SYSTEM.executePreScripts = function() {
            scriptLoader.executePreScripts();
        };
        SYSTEM.executePostScripts = function() {
            scriptLoader.executePostScripts();
        };
    }
};