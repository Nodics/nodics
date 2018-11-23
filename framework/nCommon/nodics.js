/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const infra = require('./bin/infra');


module.exports = {
    init: function () {

    },

    common: function () {
        if (!CONFIG || !SYSTEM || !NODICS) {
            SYSTEM.LOG.error("System initialization error: configuration initializer failure.");
            process.exit(1);
        }

        SYSTEM.LOG.info('Starting Utils loader process');
        SYSTEM.loadFiles('/src/utils/utils.js', global.UTILS);

        SYSTEM.LOG.info('Starting Enums loader process');
        SYSTEM.loadEnums();

    },

    start: function () {
        this.common();

        SYSTEM.LOG.info('Staring Classes loader process');
        SYSTEM.loadClasses();
    },

    cleanAll: function () {
        this.common();
        SYSTEM.cleanModules();
    },

    buildAll: function () {
        this.common();
    },

    generateModuleGroup: function () {
        infra.generateTarget('app');
    },

    generateModule: function () {
        infra.generateTarget('module');
    },

    generateReactModule: function () {
        infra.generateTarget('moduleReact');
    },

    generateVueModule: function () {
        infra.generateTarget('moduleVue');
    }
};