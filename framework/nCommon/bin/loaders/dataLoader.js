/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const util = require('util');

module.exports = {
    loadData: function(module) {
        this.loadInitData(module);
        this.loadCodeData(module);
        this.loadCommonSampleData(module);
        this.loadEnvSampleData(module);

        //console.log('Data :', util.inspect(DATA.core, false, null));
    },

    loadInitData: function(module) {
        SYSTEM.LOG.debug('Loading module core data');
        let path = module.path + '/data/init';
        SYSTEM.processFiles(path, "Data.js", (file) => {
            let initDataFile = require(file);
            _.each(initDataFile, (data, moduleName) => {
                if (DATA.init[moduleName]) {
                    _.merge(DATA.init[moduleName], data);
                } else {
                    DATA.init[moduleName] = data;
                }
            });
        });
    },

    loadCodeData: function(module) {
        SYSTEM.LOG.debug('Loading module core data');
        let path = module.path + '/data/core';
        SYSTEM.processFiles(path, "Data.js", (file) => {
            let coreDataFile = require(file);
            _.each(coreDataFile, (data, moduleName) => {
                if (DATA.core[moduleName]) {
                    _.merge(DATA.core[moduleName], data);
                } else {
                    DATA.core[moduleName] = data;
                }
            });
        });
    },

    loadCommonSampleData: function(module) {
        SYSTEM.LOG.debug('Loading module sample data');
        let path = module.path + '/data/sample/common';
        SYSTEM.processFiles(path, "Data.js", (file) => {
            let commonSampleFile = require(file);
            _.each(commonSampleFile, (data, moduleName) => {
                if (DATA.sample[moduleName]) {
                    _.merge(DATA.sample[moduleName], data);
                } else {
                    DATA.sample[moduleName] = data;
                }
            });
        });
    },

    loadEnvSampleData: function(module) {
        SYSTEM.LOG.debug('Loading module sample data');
        let path = module.path + '/data/sample/evn/' + NODICS.getActiveEnvironment();
        SYSTEM.processFiles(path, "Data.js", (file) => {
            let commonSampleFile = require(file);
            _.each(commonSampleFile, (data, moduleName) => {
                if (DATA.sample[moduleName]) {
                    _.merge(DATA.sample[moduleName], data);
                } else {
                    DATA.sample[moduleName] = data;
                }
            });
        });
    }
};