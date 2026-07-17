/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/*
   Change this file name as per test case name. This just a sample file
*/
/**
 * @module nDefault/test/common/commonTest
 * @description Common sample test scaffold for the default framework module.
 * @layer test
 * @owner nDefault
 * @override Later modules may replace scaffolds with concrete default-layer contract tests.
 */
const Chai = require('chai');
const expect = Chai.expect;

module.exports = {
    /*
        sampleTestSuite: {
            options: {
                description: 'Test suite to run all Model related sampleTestSuite',
                timeout: 100,
                type: 'utest',
                params: {
                    ui: 'tdd',
                    reporter: 'list'
                },
                beforeAll: function() {
                    console.log('This is Base beforeAll');
                },
                afterAll: function() {
                    console.log('This is Base afterAll');
                }
            },
            data: {
                value: 2
            },
            insertModel: {
                options: {
                    description: 'Test suite to run all model related insertModel',
                    beforeEach: function() {
                        console.log('   This is insertModel beforeEach');
                    },
                    beforeAll: function() {
                        console.log('   This is insertModel beforeAll');
                    },
                    afterEach: function() {
                        console.log('   This is insertModel afterEach');
                    },
                    afterAll: function() {
                        console.log('   This is insertModel afterAll');
                    }
                },
                testIfEqual: {
                    description: 'Testing equality...',
                    test: function(done) {
                        let val = 2;
                        expect(val).to.equal(TEST.uTestPool.data.value);
                        done();
                    }
                }
            }
        }
    */
};
