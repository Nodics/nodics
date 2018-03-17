/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    loadTest: function(module) {
        if (CONFIG.get('test').uTest.enabled) {
            this.loadCommonTest(module);
        }
        if (CONFIG.get('test').nTest.enabled) {
            this.loadEnvTest(module);
        }
    },

    loadCommonTest: function(module) {
        SYSTEM.LOG.info('   INFO: Loading module test cases');
        let path = module.path + '/test/common';
        SYSTEM.processFiles(path, "Test.js", (file) => {
            let testFile = this.collectTest(require(file));
            _.each(testFile, (testSuite, suiteName) => {
                if (testSuite.options.type && testSuite.options.type.toLowerCase() === 'ntest') {
                    if (TEST.nTestPool.suites[suiteName]) {
                        TEST.nTestPool.suites[suiteName] = _.merge(TEST.nTestPool.suites[suiteName], testSuite);
                    } else {
                        TEST.nTestPool.suites[suiteName] = testSuite;
                    }
                } else {
                    if (TEST.uTestPool.suites[suiteName]) {
                        TEST.uTestPool.suites[suiteName] = _.merge(TEST.uTestPool.suites[suiteName], testSuite);
                    } else {
                        TEST.uTestPool.suites[suiteName] = testSuite;
                    }
                }
            });
        });
    },

    loadEnvTest: function(module) {
        SYSTEM.LOG.info('   INFO: Loading test cases for ENV : ', NODICS.getActiveEnvironment());
        let path = module.path + '/test/env/' + NODICS.getActiveEnvironment();
        SYSTEM.processFiles(path, "Test.js", (file) => {
            let testFile = this.collectTest(require(file));
            _.each(testFile, (testSuite, suiteName) => {
                if (testSuite.options.type && testSuite.options.type.toLowerCase() === 'ntest') {
                    if (TEST.nTestPool.suites[suiteName]) {
                        TEST.nTestPool.suites[suiteName] = _.merge(TEST.nTestPool.suites[suiteName], testSuite);
                    } else {
                        TEST.nTestPool.suites[suiteName] = testSuite;
                    }
                } else {
                    if (TEST.uTestPool.suites[suiteName]) {
                        TEST.uTestPool.suites[suiteName] = _.merge(TEST.uTestPool.suites[suiteName], testSuite);
                    } else {
                        TEST.uTestPool.suites[suiteName] = testSuite;
                    }
                }
            });
        });
    },
    collectTest: function(file) {
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