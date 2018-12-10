/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'admin',
        enterpriseCode: 'default',
        name: {
            title: 'Mr.',
            firstName: 'Nodics',
            lastName: 'Employee',
        },
        loginId: 'admin',
        password: {
            loginId: 'admin',
            password: 'nodics'
        },
        userGroups: ['adminUserGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    },
    record1: {
        code: 'apiAdmin',
        enterpriseCode: 'default',
        name: {
            title: 'Mr.',
            firstName: 'apiAdmin',
            lastName: 'Employee',
        },
        loginId: 'apiAdmin',
        password: {
            loginId: 'apiAdmin',
            password: 'apiAdminInternalEmployee'
        },
        apiKey: '8171c4c4-1c97-5c76-8207-210039effc22',
        userGroups: ['adminUserGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    }
};