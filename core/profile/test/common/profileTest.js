/*
    Nodics - Enterprice API management framework

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
            insertDefaultEnterprise: {
                description: 'INFO: Insert default Enterprise',
                test: function(done) {
                    NODICS.getModels('profile', 'default').EnterpriseModel.saveOrUpdate({
                        tenant: 'default',
                        models: [{
                            _id: '5a6051e068e7aa0f6c15bcf1',
                            enterpriseCode: 'default',
                            name: 'Default',
                            description: 'Default Enterprise',
                            tenant: 'default'
                        }]
                    }).then(models => {
                        console.log('   INFO: Default Enterprise has been created');
                        done();
                    }).catch(error => {
                        console.log('   INFO: Could not create Default Enterprise');
                        done();
                    });
                }
            },
            /*insertDefaultEmployee: {
                description: 'INFO: Insert default user',
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
                        console.log('   INFO: Default employee has been created');
                        done();
                    }).catch(error => {
                        console.log('   INFO: Could not create Default employee');
                        done();
                    });
                }
            }*/
        }
    }
};