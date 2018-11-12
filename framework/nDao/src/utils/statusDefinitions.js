/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    SUC_SYS_00000: {
        code: '000000',
        description: 'Successfully processed',
        message: 'Successfully processed',
    },

    ERR_SYS_00000: {
        code: '000000',
        description: 'Failed due to some internal error',
        message: 'Failed due to some internal error',
    },
    // SUCCESS STATUS FIND
    SUC_FIND_00000: {
        code: '100000',
        description: 'Successfully processed',
        message: 'Successfully processed',
    },

    // ERROR STATUS FIND
    ERR_FIND_00000: {
        code: '100000',
        description: 'Facing some issues, Please try after some time',
        message: 'Facing some issues, Please try after some time',
    },

    ERR_FIND_00001: {
        code: '100001',
        description: 'Invalid projection value to return list of properties',
        message: 'Invalid projection value to return list of properties'
    },

    ERR_FIND_00002: {
        code: '100002',
        description: 'Invalid sort options',
        message: 'Invalid sort options',
    },

    ERR_FIND_00003: {
        code: '100003',
        description: 'Could not populate nested documents',
        message: 'Could not populate nested documents'
    },

    ERR_FIND_00004: {
        code: '100004',
        description: 'Could not execute pre interceptors',
        message: 'Could not execute pre interceptors'
    },
    ERR_FIND_00005: {
        code: '100005',
        description: 'Could not execute post interceptors',
        message: 'Could not execute post interceptors'
    },

    // SUCCESS STATUS Cache
    SUC_CACHE_00000: {
        code: '200000',
        description: 'Successfully processed',
        message: 'Successfully processed'
    },

    //ERROR STATUS Cache
    ERR_CACHE_00000: {
        code: '200000',
        description: 'Facing some issues, please try after some time',
        message: 'Facing some issues, please try after some time'
    },

    ERR_CACHE_00001: {
        code: '200001',
        description: 'Could not found item in cache',
        message: 'Could not found item in cache'
    },

    ERR_CACHE_00002: {
        code: '200002',
        description: 'Auth cache initialization failed',
        message: 'Auth cache initialization failed'
    },

    ERR_CACHE_00003: {
        code: '200003',
        description: 'Model cache initialization failed',
        message: 'Model cache initialization failed'
    },

    ERR_CACHE_00004: {
        code: '200004',
        description: 'Router cache initialization failed',
        message: 'Router cache initialization failed'
    },

    // Success Auth token 
    SUC_AUTH_00000: {
        code: '300000',
        description: 'Successfully processed',
        message: 'Successfully processed',
    },

    // Error Auth Token 
    ERR_AUTH_00000: {
        code: '300000',
        description: 'Failed authentication',
        message: 'Failed authentication',
    },

    ERR_ENT_00000: {
        code: '400000',
        description: 'Invalid enterprise code',
        message: 'Invalid enterprise code'
    },

    ERR_EMP_00000: {
        code: '400001',
        description: 'Invalid employee code',
        message: 'Invalid employee code'
    },

    ERR_CUST_00000: {
        code: '400001',
        description: 'Invalid customer code',
        message: 'Invalid customer code'
    },

    ERR_LIN_00000: {
        code: '500000',
        description: 'Invalid login Id',
        message: 'Invalid login Id'
    },

    ERR_LIN_00001: {
        code: '500001',
        description: 'Invalid password',
        message: 'Invalid password'
    },

    ERR_LIN_00002: {
        code: '500002',
        description: 'Account is currently in locked state or has been disabled',
        message: 'Account is currently in locked state or has been disabled'
    },

    ERR_LIN_00003: {
        code: '500003',
        description: 'Invalid authentication request : Given password is not valid',
        message: 'Invalid authentication request : Given password is not valid'
    }
};