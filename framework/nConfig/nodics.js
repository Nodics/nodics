/*
    Nodics - Enterprice API management framework

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
        sys.prepareOptions(options);
        if (!NODICS) {
            console.error("    ERROR: System initialization error: options cann't be null or empty");
            process.exit(1);
        }
        console.log('=>Initializing Nodics, Node based enterprise application solution   ###');
        console.log('---------------------------------------------------------------------------');
        console.log('SERVER_PATH : ', NODICS.getServerHome());
        console.log('NODICS_HOME : ', NODICS.getNodicsHome());
        console.log('NODICS_ENV  : ', NODICS.getActiveEnvironment());
        console.log('---------------------------------------------------------------------------');
        propertyLoader.init();
        systemLoader.init();

        SYSTEM.executePreScripts = function() {
            scriptLoader.executePreScripts();
        };
        SYSTEM.executePostScripts = function() {
            scriptLoader.executePostScripts();
        };
    }
};