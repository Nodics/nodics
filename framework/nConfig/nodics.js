/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const sys = require('./bin/system');

module.exports = {
    init: function () {

    },

    loadConfig: function (options) {
        let startTime = new Date();
        sys.prepareOptions(options);
        if (!NODICS) {
            sys.LOG.error("System initialization error: options cann't be null or empty");
            process.exit(1);
        }
        sys.LOG.info('###   Initializing Nodics, Node based enterprise application solution   ###');
        sys.LOG.info('---------------------------------------------------------------------------');
        sys.LOG.info('SERVER_PATH       : ', NODICS.getServerHome());
        sys.LOG.info('NODICS_HOME       : ', NODICS.getNodicsHome());
        sys.LOG.info('NODICS_APP        : ', NODICS.getActiveApplication());
        sys.LOG.info('NODICS_ENV        : ', NODICS.getActiveEnvironment());
        sys.LOG.info('NODICS_SERVER     : ', NODICS.getServerName());
        sys.LOG.info('---------------------------------------------------------------------------');
        sys.LOG.info('Starting Configuration loader process ##');
        sys.loadModuleIndex();
        sys.LOG.info('Loading modules meta data');
        sys.loadModulesMetaData();
        sys.LOG.info('Loading modules common configurations');
        sys.loadConfigurations();
        sys.loadExternalProperties();
        NODICS.setStartTime(startTime);
        sys.LOG.info('Starting System loader process');
        sys.loadFiles('/bin/system.js', global.SYSTEM);
        SYSTEM.LOG = SYSTEM.createLogger('SYSTEM');
        NODICS.LOG = SYSTEM.createLogger('NODICS');
        SYSTEM.loadPreScript();
        SYSTEM.loadPostScript();
    }
};