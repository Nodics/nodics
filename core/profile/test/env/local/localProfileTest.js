/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/*
   Change this file name as per test case name. This just a sample file.
   You can create n-number of test file and n-number of different environment as well
*/
const Chai = require('chai');
const expect = Chai.expect;

module.exports = {
    profileTestSuite: {
        options: {
            description: '   Test suite to run all user related userTestSuite',
            timeout: 100,
            type: 'ntest',
            params: {
                ui: 'tdd',
                reporter: 'list'
            },
            beforeAll: function() {
                console.log('   INFO: This is Base beforeAll');
            },
            afterAll: function() {
                console.log('   INFO: This is Base afterAll');
            }
        },
        data: {
            value: 3
        },
        insertUser: {
            options: {
                description: 'INFO: Test suite to run all user related insertUser',
                beforeEach: function() {
                    console.log('   INFO: This is insertUser beforeEach');
                },
                beforeAll: function() {
                    console.log('   INFO: This is insertUser beforeAll');
                },
                afterEach: function() {
                    console.log('   INFO: This is insertUser afterEach');
                },
                afterAll: function() {
                    console.log('   INFO: This is insertUser afterAll');
                }
            },
            testIfEqual: {
                description: 'Testing equality...1',
                test: function(done) {
                    let val = 3;
                    expect(val).to.equal(TEST.nTestPool.data.value);
                    done();
                }
            }
        }
    }
};