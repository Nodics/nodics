var _ = require('lodash');

module.exports = {
    loadTest: function(module) {
        if (CONFIG.get('test').run) {
            if (typeof TEST == 'undefined') {
                global.TEST = {
                    data: {
                        // This hold data definition which needs to be inserted to the database, 
                        //for testing purpose. In this way, we can re-use same definition for multiple test cases.
                    },
                    commonTest: {
                        //All the test cases, those needs to be executed in all environment.
                        //Best usecase could be testing all created page template
                    },
                    envTest: {
                        //All the test cases, those needs to be executed in secific environment.
                        //Best usecase could be testing all created pages
                    }
                };
            }
            this.loadCommonTest(module);
            this.loadEnvTest(module);
            console.log(TEST);
        }
    },

    loadCommonTest: function(module) {
        console.log('   INFO: Loading module test cases');
        let path = module.path + '/test/common';
        SYSTEM.processFiles(path, "Test.js", (file) => {
            let testFile = this.collectData(require(file));
            _.each(testFile, (testSuite, suiteName) => {
                if (TEST.commonTest[suiteName]) {
                    TEST.commonTest[suiteName] = _.merge(TEST.commonTest[suiteName], testSuite);
                } else {
                    TEST.commonTest[suiteName] = testSuite;
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
                if (TEST.envTest[suiteName]) {
                    TEST.envTest[suiteName] = _.merge(TEST.envTest[suiteName], testSuite);
                } else {
                    TEST.envTest[suiteName] = testSuite;
                }
            });
        });
    },

    collectData: function(file) {
        _.each(file, (testSuite, suiteName) => {
            if (testSuite.data) {
                TEST.data = _.merge(TEST.data, testSuite.data);
                delete testSuite.data;
            }
            _.each(testSuite, (testGroup, groupName) => {
                if (testGroup.data) {
                    TEST.data = _.merge(TEST.data, testGroup.data);
                    delete testGroup.data;
                }
            });
        });
        return file;
    }
};