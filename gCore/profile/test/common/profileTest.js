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
        createDefaultData: {
            options: {
                description: 'Test suite to run all user related insertUser',
                beforeEach: function() {
                    console.log('This is insertUser beforeEach');
                },
                beforeAll: function() {
                    console.log('This is insertUser beforeAll');
                },
                afterEach: function() {
                    console.log('This is insertUser afterEach');
                },
                afterAll: function() {
                    console.log('This is insertUser afterAll');
                }
            },

            testIfEqual: {
                description: 'Testing equality...1',
                test: function(done) {
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
                                        enterpriseCode: 'default',
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