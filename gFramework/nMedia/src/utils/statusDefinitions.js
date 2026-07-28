/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/src/utils/statusDefinitions
 * @description Defines nMedia success and error status metadata.
 * @layer utils
 * @owner nMedia
 * @override Later framework or project layers may extend messages while preserving code semantics.
 */
module.exports = {
    SUC_MED_00001: {
        code: '200',
        message: 'Media storage policy resolved successfully'
    },
    SUC_MED_00002: {
        code: '200',
        message: 'Media storage location resolved successfully'
    },
    SUC_MED_00003: {
        code: '200',
        message: 'Media reference validated successfully'
    },
    SUC_MED_00004: {
        code: '200',
        message: 'Media uploaded successfully'
    },
    ERR_MED_00001: {
        code: '400',
        message: 'Invalid media request'
    },
    ERR_MED_00002: {
        code: '400',
        message: 'Invalid media storage provider'
    },
    ERR_MED_00003: {
        code: '400',
        message: 'Invalid media folder'
    },
    ERR_MED_00004: {
        code: '400',
        message: 'Unsafe media storage key'
    },
    ERR_MED_00005: {
        code: '400',
        message: 'Media file policy validation failed'
    },
    ERR_MED_00006: {
        code: '500',
        message: 'Media storage provider failed'
    },
    ERR_MED_00007: {
        code: '400',
        message: 'Invalid media reference lookup request'
    },
    ERR_MED_00008: {
        code: '404',
        message: 'Media reference was not found'
    },
    ERR_MED_00009: {
        code: '500',
        message: 'Media metadata service is unavailable'
    },
    ERR_MED_00010: {
        code: '400',
        message: 'Invalid media multipart upload request'
    },
    ERR_MED_00011: {
        code: '400',
        message: 'Media import source is unavailable'
    }
};
