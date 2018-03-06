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
const expect = Chai.expect;

module.exports = {

    executeUTest: function() {
        return new Promise((resolve, reject) => {
            let testConfig = CONFIG.get('test');
            if (!UTILS.isBlank(TEST.uTestPool.suites) && testConfig.enabled && testConfig.uTest.enabled) {
                NODICS.setActiveChannel('test');
                console.log('   INFO: Starting Unit Test Execution Process with Active Channel : ', NODICS.getActiveChannel());
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
                        console.log('some error : ', error);
                    });
                } catch (error) {
                    NODICS.setActiveChannel('master');
                    //console.log('   ERROR: got error while starting unit test case execution : ', error);
                    reject('got error while starting unit test case execution : ' + error);
                }
            } else {
                reject('Test cases are not allowed to be executed, change configuration');
            }
        });
    },

    executeNTest: function() {
        return new Promise((resolve, reject) => {
            let testConfig = CONFIG.get('test');
            if (!UTILS.isBlank(TEST.nTestPool.suites) && testConfig.enabled && testConfig.nTest.enabled) {
                NODICS.setNTestRunning(true);
                console.log('   INFO: Starting N-Test Execution Process with Active Channel : ', NODICS.getActiveChannel());
                try {
                    let nTestMasterMocha = new Mocha();
                    let nTestMasterSuite = Mocha.Suite.create(nTestMasterMocha.suite, 'Starting master suite execution for N-Test');
                    this.createSuites(nTestMasterSuite, TEST.nTestPool);
                    //TEST.nTestPool.nTestMasterMocha = nTestMasterMocha;

                    nTestMasterMocha.run(function(failures) {
                        process.on('exit', function() {
                            process.exit(failures);
                        });
                    }).on('end', () => {
                        NODICS.setNTestRunning(false);
                        resolve(true);
                    });
                } catch (error) {
                    NODICS.setNTestRunning(false);
                    //console.log('   ERROR: got error while starting N-Test case execution : ', error);
                    reject('got error while starting n-test case execution : ' + error);
                }
            } else {
                reject('Test cases are not allowed to be executed, change configuration');
            }
        });
    },

    createSuites: function(masterSuite, testSuites) {
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

    createTestGroup: function(suiteName, testSuite, baseSuite) { //one top suite
        let _self = this;
        _.each(testSuite, (testGroup, groupName) => {
            if (groupName !== 'data' && groupName !== 'options') {
                let mocha = testGroup.options.params ? new Mocha(testGroup.options.params) : new Mocha();
                let suite = _self.createSuite(mocha, groupName, testGroup, baseSuite);
                _self.createTestCase(groupName, testGroup, suite);
            }
        });
    },

    createTestCase: function(groupName, testGroup, testSuite) {
        let _self = this;
        _.each(testGroup, (testCase, testName) => {
            if (testName !== 'data' && testName !== 'options') {
                _self.createTest(testName, testCase, testSuite);
            }
        });
    },

    createSuite: function(mocha, suiteName, testSuite, baseSuite) {
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

    createTest: function(testName, testCase, suite) {
        suite.addTest(new Test(testCase.description, testCase.test));
    }
};