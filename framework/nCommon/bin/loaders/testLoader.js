/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    loadTest: function(module) {
        if (CONFIG.get('test').run) {
            this.loadCommonTest(module);
            this.loadEnvTest(module);
        }
    },

    loadCommonTest: function(module) {
        console.log('   INFO: Loading module test cases');
        let path = module.path + '/test/common';
        SYSTEM.processFiles(path, "Test.js", (file) => {
            let testFile = this.collectData(require(file));
            _.each(testFile, (testSuite, suiteName) => {
                if (testSuite.options.type && testSuite.options.type.toLowerCase() === 'ntest') {
                    if (TEST.nTestPool[suiteName]) {
                        TEST.nTestPool[suiteName] = _.merge(TEST.nTestPool[suiteName], testSuite);
                    } else {
                        TEST.nTestPool[suiteName] = testSuite;
                    }
                } else {
                    if (TEST.uTestPool[suiteName]) {
                        TEST.uTestPool[suiteName] = _.merge(TEST.uTestPool[suiteName], testSuite);
                    } else {
                        TEST.uTestPool[suiteName] = testSuite;
                    }
                }
            });
        });
    },

    loadEnvTest: function(module) {
        console.log('   INFO: Loading test cases for ENV : ', NODICS.getActiveEnvironment());
        let path = module.path + '/test/env-' + NODICS.getActiveEnvironment();
        SYSTEM.processFiles(path, "Test.js", (file) => {
            let testFile = this.collectData(require(file));
            _.each(testFile, (testSuite, suiteName) => {
                if (testSuite.options.type && testSuite.options.type.toLowerCase() === 'ntest') {
                    if (TEST.nTestPool[suiteName]) {
                        TEST.nTestPool[suiteName] = _.merge(TEST.nTestPool[suiteName], testSuite);
                    } else {
                        TEST.nTestPool[suiteName] = testSuite;
                    }
                } else {
                    if (TEST.uTestPool[suiteName]) {
                        TEST.uTestPool[suiteName] = _.merge(TEST.uTestPool[suiteName], testSuite);
                    } else {
                        TEST.uTestPool[suiteName] = testSuite;
                    }
                }
            });
        });
    },
    collectData: function(file) {
        _.each(file, (testSuite, suiteName) => {
            if (testSuite.data) {
                if (testSuite.options.type && testSuite.options.type.toLowerCase() === 'ntest') {
                    TEST.nTestPool.data = _.merge(TEST.nTestPool.data, testSuite.data);
                } else {
                    TEST.uTestPool.data = _.merge(TEST.uTestPool.data, testSuite.data);
                }
                delete testSuite.data;
            }
            _.each(testSuite, (testGroup, groupName) => {
                if (testGroup.data) {
                    if (testSuite.options.type && testSuite.options.type.toLowerCase() === 'ntest') {
                        TEST.nTestPool.data = _.merge(TEST.nTestPool.data, testGroup.data);
                    } else {
                        TEST.uTestPool.data = _.merge(TEST.uTestPool.data, testGroup.data);
                    }
                    delete testGroup.data;
                }
            });
        });
        return file;
    }
};