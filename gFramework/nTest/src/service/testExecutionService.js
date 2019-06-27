/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
/**
 * Initialize a `Runner` for the given `suite`.
 *
 * Events:
 *
 *   - `start`  execution started
 *   - `end`  execution complete
 *   - `suite`  (suite) test suite execution started
 *   - `suite end`  (suite) all tests (and sub-suites) have finished
 *   - `test`  (test) test execution started
 *   - `test end`  (test) test completed
 *   - `hook`  (hook) hook execution started
 *   - `hook end`  (hook) hook complete
 *   - `pass`  (test) test passed
 *   - `fail`  (test, err) test failed
 *   - `pending`  (test) test pending
 */

const _ = require('lodash');
const Mocha = require('mocha');
const Chai = require('chai');
const Test = Mocha.Test;

module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    runUTest: function (input, callback) {
        let _self = this;
        if (callback) {
            _self.executeUTest().then(success => {
                _self.LOG.info('U-Test cases Executed successfully');
                callback(null, 'U-Test cases Executed successfully');
            }).catch(error => {
                _self.LOG.error(error);
                callback(error);
            });
        } else {
            return _self.executeUTest();
        }
    },

    runNTest: function (input, callback) {
        let _self = this;
        if (callback) {
            _self.executeNTest().then(success => {
                _self.LOG.info('N-Test cases Executed successfully');
                callback(null, 'N-Test cases Executed successfully');
            }).catch(error => {
                _self.LOG.error(error);
                callback(error);
            });
        } else {
            return _self.executeNTest();
        }
    },

    executeUTest: function () {
        return new Promise((resolve, reject) => {
            let testConfig = CONFIG.get('test');
            if (testConfig.enabled && testConfig.uTest.enabled) {
                if (!UTILS.isBlank(TEST.uTestPool.suites)) {
                    NODICS.setActiveChannel('test');
                    this.LOG.debug('Starting Unit Test Execution Process with Active Channel : ' + NODICS.getActiveChannel());
                    try {
                        let uTestMasterMocha = new Mocha({ timeout: 10 });
                        let uTestMasterSuite = Mocha.Suite.create(uTestMasterMocha.suite, 'Starting master suite execution for U-Test');
                        this.createSuites(uTestMasterSuite, TEST.uTestPool);
                        uTestMasterMocha.run(failures => {
                            process.on('exit', () => {
                                NODICS.setActiveChannel('master');
                                process.exit(failures);
                            });
                        }).on('end', () => {
                            NODICS.setActiveChannel('master');
                            resolve(true);
                        }).on('error', (error) => {
                            this.LOG.error('some error : ', error);
                        });
                    } catch (error) {
                        NODICS.setActiveChannel('master');
                        reject('got error while starting unit test case execution : ' + error);
                    }
                } else {
                    reject('There are none test cases to execute, please write some');
                }
            } else {
                reject('Test cases are not allowed to be executed, change configuration');
            }
        });
    },

    executeNTest: function () {
        return new Promise((resolve, reject) => {
            let testConfig = CONFIG.get('test');
            if (testConfig.enabled && testConfig.nTest.enabled) {
                if (!UTILS.isBlank(TEST.nTestPool.suites)) {
                    NODICS.setNTestRunning(true);
                    this.LOG.debug('Starting N-Test Execution Process with Active Channel : ' + NODICS.getActiveChannel());
                    try {
                        let nTestMasterMocha = new Mocha();
                        let nTestMasterSuite = Mocha.Suite.create(nTestMasterMocha.suite, 'Starting master suite execution for N-Test');
                        this.createSuites(nTestMasterSuite, TEST.nTestPool);
                        nTestMasterMocha.run(function (failures) {
                            process.on('exit', function () {
                                process.exit(failures);
                            });
                        }).on('end', () => {
                            NODICS.setNTestRunning(false);
                            resolve(true);
                        });
                    } catch (error) {
                        NODICS.setNTestRunning(false);
                        reject('got error while starting n-test case execution : ', error);
                    }
                } else {
                    reject('There are none test cases to execute, please write some');
                }
            } else {
                reject('Test cases are not allowed to be executed, change configuration');
            }
        });
    },

    createSuites: function (masterSuite, testSuites) {
        let _self = this;
        _.each(testSuites.suites, (testSuite, suiteName) => {
            if (!UTILS.isBlank(testSuite) && suiteName !== 'data') {
                let mocha = testSuite.options.params ? new Mocha(testSuite.options.params) : new Mocha();
                let suite = _self.createSuite(mocha, suiteName, testSuite, masterSuite);
                if (!UTILS.isBlank(suite)) {
                    _self.createTestGroup(suiteName, testSuite, suite);
                }
            }
        });
    },

    createTestGroup: function (suiteName, testSuite, baseSuite) { //one top suite
        let _self = this;
        _.each(testSuite, (testGroup, groupName) => {
            if (groupName !== 'data' && groupName !== 'options') {
                let mocha = testGroup.options.params ? new Mocha(testGroup.options.params) : new Mocha();
                let suite = _self.createSuite(mocha, groupName, testGroup, baseSuite);
                _self.createTestCase(groupName, testGroup, suite);
            }
        });
    },

    createTestCase: function (groupName, testGroup, testSuite) {
        let _self = this;
        _.each(testGroup, (testCase, testName) => {
            if (testName !== 'data' && testName !== 'options') {
                _self.createTest(testName, testCase, testSuite);
            }
        });
    },

    createSuite: function (mocha, suiteName, testSuite, baseSuite) {
        let suite = Mocha.Suite.create(mocha.suite, testSuite.options.description);
        if (testSuite.options.timeout) {
            suite.timeout(testSuite.options.timeout);
        }
        if (testSuite.options.beforeEach) {
            suite.beforeEach(testSuite.options.beforeEach);
        }
        if (testSuite.options.beforeAll) {
            suite.beforeAll(testSuite.options.beforeAll);
        }
        if (testSuite.options.afterEach) {
            suite.afterEach(testSuite.options.afterEach);
        }
        if (testSuite.options.afterAll) {
            suite.afterAll(testSuite.options.afterAll);
        }
        if (baseSuite) {
            baseSuite.addSuite(suite);
        }
        return suite;
    },

    createTest: function (testName, testCase, suite) {
        suite.addTest(new Test(testCase.description, testCase.test));
    }
};