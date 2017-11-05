/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const utilsLoader = require('./bin/utilsLoader');
const enumLoader = require('./bin/enumLoader');
const classesLoader = require('./bin/classesLoader');
const moduleLoader = require('./bin/moduleLoader');

module.exports = {
    init: function() {

    },

    loadCommon: function() {
        if (!CONFIG || !SYSTEM || !NODICS) {
            console.error("   ERROR: System initialization error: configuration initializer failure.");
            process.exit(1);
        }
        utilsLoader.loadUtils();
        enumLoader.loadEnums();
        classesLoader.loadClasses();

        SYSTEM.loadModules = function() {
            moduleLoader.init();
        };
    }
};