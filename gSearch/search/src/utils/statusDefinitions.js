/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    SUC_SRCH_00000: {
        code: '150000',
        description: 'Successfully processed',
        message: 'Successfully processed',
    },

    ERR_SRCH_00000: {
        code: '150000',
        description: 'Failed due to some internal error',
        message: 'Failed due to some internal error',
    },

    ERR_SRCH_00001: {
        code: '150001',
        description: 'Search cluster is down or please check configuration',
        message: 'Search cluster is down or please check configuration'
    },

    ERR_SRCH_00002: {
        code: '150002',
        description: 'Could not retrieve list of available indexes',
        message: 'Could not retrieve list of available indexes'
    },

    ERR_SRCH_00003: {
        code: '150003',
        description: 'Could not found indexer configuration',
        message: 'Could not found indexer configuration'
    },

    ERR_SRCH_00004: {
        code: '150004',
        description: 'Facing issue while fetching indexer configuration',
        message: 'Facing issue while fetching indexer configuration'
    },

    ERR_SRCH_00005: {
        code: '150005',
        description: 'Invalid indexName, mismatch with indexer configuration',
        message: 'Invalid indexName, mismatch with indexer configuration'
    },
    ERR_SRCH_00006: {
        code: '150006',
        description: 'While changing indexer state to RUNNING',
        message: 'While changing indexer state to RUNNING'
    }
};