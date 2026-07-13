/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gframes/gframesModules/gfprofile/data/init/data/user/defaultGrayFranesCustomerData
 * @description Provides gframesModules initializer or sample data consumed by the import layer.
 * @layer data
 * @owner gframesModules
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    record0: {
        code: 'himkar',
        active: true,
        name: {
            title: 'Mr.',
            firstName: 'Nodics',
            lastName: 'Customer',
        },
        loginId: 'hikehim@gmail.com',
        password: {
            loginId: 'hikehim@gmail.com',
            password: 'hiketech',
            active: true
        },
        userGroups: ['customerUserGroup'],
        addresses: ['defaultCustomerAddress'],
        contacts: ['defaultCustomerContact']
    }
};