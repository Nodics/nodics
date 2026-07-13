/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/*
   Change this file name as per test case name. This just a sample file
*/
const Chai = require('chai');
const expect = Chai.expect;

/**
 * @module gCore/profile/test/common/profileTest
 * @description Defines profile test fixtures or suites for module behavior validation.
 * @layer test
 * @owner profile
 * @override Projects may add focused tests beside this file while preserving the module contract under test.
 */
module.exports = {
    profileTestSuite: {
        options: {
            description: 'Test suite to run all user related userTestSuite',
            timeout: 100,
            type: 'utest',
            params: {
                ui: 'tdd',
                reporter: 'list'
            },
            /**
             * Executes before all behavior.
             *
             * @returns {*} Method result.
             */
            beforeAll: function () {
                console.log('This is Base beforeAll');
            },
            /**
             * Executes after all behavior.
             *
             * @returns {*} Method result.
             */
            afterAll: function () {
                console.log('This is Base afterAll');
            }
        },
        data: {
            value: 2
        },
        createDefaultData: {
            options: {
                description: 'Test suite to run all user related insertUser',
                /**
                 * Executes before each behavior.
                 *
                 * @returns {*} Method result.
                 */
                beforeEach: function () {
                    console.log('This is insertUser beforeEach');
                },
                /**
                 * Executes before all behavior.
                 *
                 * @returns {*} Method result.
                 */
                beforeAll: function () {
                    console.log('This is insertUser beforeAll');
                },
                /**
                 * Executes after each behavior.
                 *
                 * @returns {*} Method result.
                 */
                afterEach: function () {
                    console.log('This is insertUser afterEach');
                },
                /**
                 * Executes after all behavior.
                 *
                 * @returns {*} Method result.
                 */
                afterAll: function () {
                    console.log('This is insertUser afterAll');
                }
            },

            testIfEqual: {
                description: 'Testing equality...1',
                /**
                 * Executes test behavior.
                 *
                 * @param {*} done Method input.
                 * @returns {*} Method result.
                 */
                test: function (done) {
                    let val = 2;
                    expect(val).to.equal(TEST.uTestPool.data.value);
                    done();
                }
            }
            /*
                        insertDefaultEmployee: {
                            description: 'Insert default user',
                            test: function(done) {
                                NODICS.getModels('profile', 'default').EmployeeModel.saveOrUpdate({
                                    tenant: 'default',
                                    models: [{
                                        _id: '5a6051e068e7aa0f6c15bcb1',
                                        firstName: 'Himkar',
                                        middleName: 'Admin',
                                        lastName: 'Admin',
                                        loginId: 'admin',
                                        password: 'nodics',
                                        active: true
                                    }]
                                }).then(models => {
                                    console.log('Default employee has been created');
                                    done();
                                }).catch(error => {
                                    console.log('Could not create Default employee');
                                    done();
                                });
                            }
                        }*/
        }
    }
};