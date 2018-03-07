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
            operation: 'save', //save, update and saveOrUpdate
            tenant: 'default',

            models: {
                defaultEnterprise: {
                    _id: '5a9e7dd88ac6ed3d73a76711',
                    enterpriseCode: 'default',
                    name: 'Default',
                    description: 'Default Enterprise',
                    tenant: 'default'
                }
            }
        },

        createDefaultEmployee: {
            modelName: 'employee',
            operation: 'save', //save, update and saveOrUpdate
            tenant: 'default',

            models: {
                defaultEmployee: {
                    _id: '5a9e7dd88ac6ed3d73a76712',
                    enterpriseCode: 'default',
                    firstName: 'Himkar',
                    middleName: 'Admin',
                    lastName: 'Admin',
                    loginId: 'admin',
                    password: 'nodics',
                    active: true
                }
            }
        }
    }
};