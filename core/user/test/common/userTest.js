/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const Chai = require('chai');
const expect = Chai.expect;

module.exports = {
    userTestSuite: {
        options: {
            description: 'Test suite to run all user related userTestSuite',
            timeout: 100,
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
        insertUser: {
            options: {
                description: 'Test suite to run all user related insertUser',
                beforeEach: function() {
                    console.log('   This is insertUser beforeEach');
                },
                beforeAll: function() {
                    console.log('   This is insertUser beforeAll');
                },
                afterEach: function() {
                    console.log('   This is insertUser afterEach');
                },
                afterAll: function() {
                    console.log('   This is insertUser afterAll');
                }
            },
            testIfEqual: {
                description: 'Testing equality...',
                test: function(done) {
                    //console.log(TEST.data.value);
                    expect(TEST.data.value).to.equal(TEST.data.value);
                    done();
                }
            }
        }
    }
};