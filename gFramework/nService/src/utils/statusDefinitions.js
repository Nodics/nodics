/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    SUC_SRCH_00000: {
        code: '200',
        message: 'Successfully processed',
    },

    ERR_SRCH_00000: {
        code: '400',
        message: 'Failed due to internal error',
    },
    ERR_SRCH_00001: {
        code: '400',
        message: 'Search cluster is down or please check configuration'
    },
    ERR_SRCH_00002: {
        code: '400',
        message: 'Could not retrieve list of available indexes'
    },
    ERR_SRCH_00003: {
        code: '400',
        message: 'Could not found indexer configuration'
    },
    ERR_SRCH_00004: {
        code: '400',
        message: 'Facing issue while fetching indexer configuration'
    },
    ERR_SRCH_00005: {
        code: '400',
        message: 'Invalid indexName, mismatch with indexer configuration'
    },
    ERR_SRCH_00006: {
        code: '400',
        message: 'While changing indexer state to RUNNING'
    },
    ERR_SRCH_00007: {
        code: '400',
        message: 'Facing issues while executing pre save processors'
    },
    ERR_SRCH_00008: {
        code: '400',
        message: 'Facing issues while executing post save processors'
    },
    ERR_SRCH_00009: {
        code: '400',
        message: 'Facing issues while executing pre interceptors or validators'
    },
    ERR_SRCH_00010: {
        code: '400',
        message: 'Facing issues while executing pre interceptors or validators'
    },
    ERR_TNT_00000: {
        code: '400001',
        message: 'Invalid tenant id'
    },
};