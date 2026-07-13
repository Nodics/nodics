/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/data/init/data/address/defaultAddressesData
 * @description Provides profile initializer or sample data consumed by the import layer.
 * @layer data
 * @owner profile
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    record0: {
        type: 'OFFICE',
        isPrimery: true,
        code: 'defaultEntAddress',
        active: true,
        flatNo: '100',
        building: 'Nodics Technology Park',
        street: '100 lake side',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001'
    }
};