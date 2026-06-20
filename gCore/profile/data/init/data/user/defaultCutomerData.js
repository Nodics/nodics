/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');

module.exports = {
    record0: {
        code: 'guest',
        active: false,
        name: {
            title: 'Mr.',
            firstName: 'Nodics',
            lastName: 'Customer',
        },
        loginId: 'guest',
        password: {
            loginId: 'guest',
            password: crypto.randomBytes(32).toString('base64url'),
            active: true
        },
        principalType: 'customer',
        userGroups: ['customerUserGroup'],
        addresses: ['defaultCustomerAddress'],
        contacts: ['defaultCustomerContact']
    }
};
