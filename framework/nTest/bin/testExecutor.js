/*
    Nodics - Enterprice API management framework

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
    initTestExecution: function() {
        if (NODICS.getServerState() === 'started') {
            if (CONFIG.get('test').run) {
                console.log('---------------------------------------------------------------------------');
                console.log('=> Starting test case execution process   ###');
                console.log('---------------------------------------------------------------------------');
                this.executeUTest();
            }
        } else {
            setTimeout(this.initTestExecution, 1000);
        }
    },

    executeUTest: function() {
        if (!UTILS.isBlank(TEST.uTestPool)) {
            NODICS.setActiveChannel('test');
            console.log('   INFO: Starting Unit Test Execution Process with Active Channel : ', NODICS.getActiveChannel());
            try {
                let masterMocha = new Mocha();
                let masterSuite = Mocha.Suite.create(masterMocha.suite, 'Starting master suite execution for Unit Test');
                this.createSuites(masterSuite, TEST.uTestPool);

                masterMocha.run(function(failures) {
                    process.on('exit', () => {
                        process.exit(failures);
                        NODICS.setActiveChannel('master');
                        this.executeNTest();
                    });
                }).on('end', () => {
                    NODICS.setActiveChannel('master');
                    this.executeNTest();
                });
            } catch (error) {
                console.log('   ERROR: got error while starting unit test case execution : ', error);
                NODICS.setActiveChannel('master');
                process.exit(CONFIG.get('errorExitCode'));
            }
        } else {
            this.executeNTest();
        }
    },

    executeNTest: function() {
        if (!UTILS.isBlank(TEST.nTestPool)) {
            NODICS.setNTestRunning(true);
            console.log('   INFO: Starting N-Test Execution Process with Active Channel : ', NODICS.getActiveChannel());
            try {
                let masterMocha = new Mocha();
                let masterSuite = Mocha.Suite.create(masterMocha.suite, 'Starting master suite execution for N-Test');
                this.createSuites(masterSuite, TEST.nTestPool);
                masterMocha.run(function(failures) {
                    process.on('exit', function() {
                        process.exit(failures);
                    });
                }).on('end', () => {
                    NODICS.setNTestRunning(false);
                });
            } catch (error) {
                NODICS.setNTestRunning(false);
                console.log('   ERROR: got error while starting N-Test case execution : ', error);
                process.exit(CONFIG.get('errorExitCode'));
            }
        }
    },

    createSuites: function(masterSuite, testSuites) { // whole file
        let _self = this;
        _.each(testSuites, (testSuite, suiteName) => {
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
    },
};