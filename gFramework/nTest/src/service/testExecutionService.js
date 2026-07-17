/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

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

/**
 * @module nTest/service/TestExecutionService
 * @description Executes Nodics unit-test and n-test pools by translating layered test definitions into Mocha suites.
 * @layer service
 * @owner nTest
 * @override Project modules may override this service to customize test execution, suite construction, or reporting.
 */
module.exports = {
    /**
     * Initializes the test execution service during service loading.
     *
     * @param {Object} options Loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the test execution service after service loading.
     *
     * @param {Object} options Loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Runs unit tests and optionally reports completion through a callback.
     *
     * @param {Object} input Test execution input; currently reserved for tenant and enterprise context.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise<boolean>|void} Promise when no callback is supplied.
     */
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

    /**
     * Runs Nodics integration tests and optionally reports completion through a callback.
     *
     * @param {Object} input Test execution input; currently reserved for tenant and enterprise context.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise<boolean>|void} Promise when no callback is supplied.
     */
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

    /**
     * Executes the configured unit-test pool using Mocha.
     *
     * @returns {Promise<boolean>} Resolves after unit tests finish; rejects when tests are disabled or unavailable.
     * @sideEffects Temporarily switches the active channel to `test` and restores `master` after execution.
     */
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
                        reject(new CLASSES.NodicsError(error, 'got error while starting unit test case execution', 'ERR_SYS_00000'));
                    }
                } else {
                    reject(new CLASSES.NodicsError('ERR_SYS_00000', 'There are none test cases to execute, please write some'));
                }
            } else {
                reject(new CLASSES.NodicsError('ERR_SYS_00000', 'Test cases are not allowed to be executed, change configuration'));
            }
        });
    },

    /**
     * Executes the configured Nodics test pool using Mocha.
     *
     * @returns {Promise<boolean>} Resolves after n-tests finish; rejects when tests are disabled or unavailable.
     * @sideEffects Marks n-test execution as running while the suite is active.
     */
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
                        reject(new CLASSES.NodicsError(error, 'got error while starting n-test case execution', 'ERR_SYS_00000'));
                    }
                } else {
                    reject(new CLASSES.NodicsError('ERR_SYS_00000', 'There are none test cases to execute, please write some'));
                }
            } else {
                reject(new CLASSES.NodicsError('ERR_SYS_00000', 'Test cases are not allowed to be executed, change configuration'));
            }
        });
    },

    /**
     * Creates top-level Mocha suites from a Nodics test suite pool.
     *
     * @param {Object} masterSuite Parent Mocha suite that receives generated child suites.
     * @param {Object} testSuites Nodics test pool containing named suite definitions.
     * @returns {void}
     */
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

    /**
     * Creates grouped Mocha suites inside a top-level Nodics test suite.
     *
     * @param {string} suiteName Parent suite name.
     * @param {Object} testSuite Nodics suite definition containing groups and options.
     * @param {Object} baseSuite Parent Mocha suite.
     * @returns {void}
     */
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

    /**
     * Creates Mocha test cases inside a Nodics test group.
     *
     * @param {string} groupName Test group name.
     * @param {Object} testGroup Nodics test group containing test case definitions.
     * @param {Object} testSuite Mocha suite receiving tests.
     * @returns {void}
     */
    createTestCase: function (groupName, testGroup, testSuite) {
        let _self = this;
        _.each(testGroup, (testCase, testName) => {
            if (testName !== 'data' && testName !== 'options') {
                _self.createTest(testName, testCase, testSuite);
            }
        });
    },

    /**
     * Creates a Mocha suite from Nodics suite options and attaches hooks.
     *
     * @param {Object} mocha Mocha instance used to create the suite.
     * @param {string} suiteName Logical suite name.
     * @param {Object} testSuite Nodics suite definition containing options and hooks.
     * @param {Object} [baseSuite] Optional parent suite.
     * @returns {Object} Created Mocha suite.
     */
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

    /**
     * Adds a Mocha test to a suite from a Nodics test-case definition.
     *
     * @param {string} testName Logical test name.
     * @param {Object} testCase Nodics test case containing description and test function.
     * @param {Object} suite Mocha suite receiving the test.
     * @returns {void}
     */
    createTest: function (testName, testCase, suite) {
        suite.addTest(new Test(testCase.description, testCase.test));
    }
};
