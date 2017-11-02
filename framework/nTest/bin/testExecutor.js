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
            let suitePool = new CLASSES.TestSuitePool();
            let index = 0;
            if (!SYSTEM.isBlank(TEST.commonTest)) {
                index = this.createSuites(index, suitePool, TEST.commonTest);
            }
            if (!SYSTEM.isBlank(TEST.envTest)) {
                index = this.createSuites(index, suitePool, TEST.envTest);
            }
            _.each(suitePool.getAllSuite(), (testSuite, suiteName) => {
                //console.log('------------------ : ', testSuite.index);
                testSuite.mocha.run();
            });
        }
    },

    createMochSuite: function(mocha, testSuite, suiteName, baseSuite) {
        let suite = Mocha.Suite.create(mocha.suite, testSuite.options.description);
        if (baseSuite) {
            baseSuite.addSuite(suite);
        }
        return suite;
    },

    createMochaTest: function(testName, testCase, suite) {
        suite.addTest(new Test('testing tests : ' + testName, function() {
            expect(2).to.equal(2);
        }));
    },

    createSuites: function(index, suitePool, testSuites) { // whole file
        let _self = this;
        _.each(testSuites, (testSuite, suiteName) => {
            if (!SYSTEM.isBlank(testSuite)) {
                let mocha = new Mocha();
                let suite = _self.createMochSuite(mocha, testSuite, suiteName);
                if (!SYSTEM.isBlank(suite)) {
                    _self.createTestGroup(suiteName, testSuite, suite);
                    suitePool.addSuite(suiteName, {
                        index: index,
                        suite: suite,
                        mocha: mocha
                    });
                }
                index++;
            }
        });
        return index;
    },

    createTestGroup: function(suiteName, testSuite, baseSuite) { //one top suite
        let _self = this;
        _.each(testSuite, (testGroup, groupName) => {
            if (groupName !== 'data' && groupName !== 'options') {
                let mocha = new Mocha();
                let suite = _self.createMochSuite(mocha, testSuite, suiteName, baseSuite);
                _self.createTestCase(groupName, testGroup, suite);
            }
        });
    },

    createTestCase: function(groupName, testGroup, testSuite) {
        let _self = this;
        _.each(testGroup, (testCase, testName) => {
            if (testName !== 'data' && testName !== 'options') {
                _self.createMochaTest(testName, testCase, testSuite);
            }
        });
    }
};