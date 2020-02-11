/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'sampleDefaultValidator',
        type: 'schema',
        //item: 'customer', // not required, because it should be common
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultSampleValidatorService.handlePreSave'
    },

    record1: {
        code: 'sampleAddressValidator',
        type: 'schema',
        item: 'address', // not required, because it should be common
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultSampleValidatorService.handlePreAddressSave'
    }
};