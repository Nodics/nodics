/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    profile: {

        createDefaultEnterprise: {
            modelName: 'enterprise',
            operation: 'saveOrUpdate', //save, update and saveOrUpdate
            tenant: 'default',

            models: {
                defaultEnterprise: {
                    _id: '111e7dd88ac6ed3d73a76711',
                    enterpriseCode: 'default',
                    name: 'Default',
                    description: 'Default Enterprise',
                    tenant: 'default'
                }
            }
        },

        createDefaultEmployee: {
            modelName: 'employee',
            operation: 'saveOrUpdate', //save, update and saveOrUpdate
            tenant: 'default',

            models: {
                defaultEmployee: {
                    _id: '121e7dd88ac6ed3d73a76712',
                    enterpriseCode: 'default',
                    firstName: 'Himkar',
                    middleName: 'Admin',
                    lastName: 'Admin',
                    loginId: 'admin',
                    locked: false,
                    active: true,
                    attempts: 1
                }
            }
        },

        createDefaultPassword: {
            modelName: 'password',
            operation: 'saveOrUpdate', //save, update and saveOrUpdate
            tenant: 'default',

            models: {
                defaultEmployee: {
                    _id: '121e7dd88ac6ed3d73a76333',
                    personId: '121e7dd88ac6ed3d73a76712',
                    enterpriseCode: 'default',
                    loginId: 'admin',
                    password: 'nodics'
                }
            }
        }
    },

    testModule: {

        createDefaultEnterprise1: {
            modelName: 'enterprise',
            operation: 'saveOrUpdate', //save, update and saveOrUpdate
            tenant: 'default',

            models: {
                defaultEnterprise: {
                    _id: '111e7dd88ac6ed3d73a76722',
                    enterpriseCode: 'default',
                    name: 'Default1',
                    description: 'Default1 Enterprise',
                    tenant: 'default'
                }
            }
        },

        createDefaultEmployee1: {
            modelName: 'employee',
            operation: 'saveOrUpdate', //save, update and saveOrUpdate
            tenant: 'default',

            models: {
                defaultEmployee: {
                    _id: '121e7dd88ac6ed3d73a76722',
                    enterpriseCode: 'default1',
                    firstName: 'Himkar',
                    middleName: 'Admin',
                    lastName: 'Admin',
                    loginId: 'admin1',
                    locked: false,
                    active: true,
                    attempts: 1
                }
            }
        },

        createDefaultPassword1: {
            modelName: 'password',
            operation: 'saveOrUpdate', //save, update and saveOrUpdate
            tenant: 'default',

            models: {
                defaultEmployee: {
                    _id: '121e7dd88ac6ed3d73a76323',
                    personId: '121e7dd88ac6ed3d73a76722',
                    enterpriseCode: 'default1',
                    loginId: 'admin1',
                    password: 'nodics'
                }
            }
        }
    }
};