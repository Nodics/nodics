/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const Mocha = require('mocha');
const Chai = require('chai');
const Test = Mocha.Test;
const expect = Chai.expect;

module.exports = {
    initTestExecution: function() {
        if (CONFIG.get('test').run) {
            console.log('---------------------------------------------------------------------------');
            console.log('=> Starting test case execution process   ###');
            console.log('ACTIVE_CAHNNEL : ', NODICS.getActiveChannel());
            console.log('ACTIVE_TANENT  : ', NODICS.getActiveTanent());
            console.log('---------------------------------------------------------------------------');
            let masterMocha = new Mocha();
            let masterSuite = Mocha.Suite.create(masterMocha.suite, 'Starting master suite execution');
            if (!SYSTEM.isBlank(TEST.commonTest)) {
                this.createSuites(masterSuite, TEST.commonTest);
            }
            if (!SYSTEM.isBlank(TEST.envTest)) {
                this.createSuites(masterSuite, TEST.envTest);
            }
            masterMocha.run(function(failures) {
                process.on('exit', function() {
                    process.exit(failures);
                });
            });
        }
    },

    createSuites: function(masterSuite, testSuites) { // whole file
        let _self = this;
        _.each(testSuites, (testSuite, suiteName) => {
            if (!SYSTEM.isBlank(testSuite)) {
                let mocha = testSuite.options.params ? new Mocha(testSuite.options.params) : new Mocha();
                let suite = _self.createSuite(mocha, suiteName, testSuite, masterSuite);
                if (!SYSTEM.isBlank(suite)) {
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