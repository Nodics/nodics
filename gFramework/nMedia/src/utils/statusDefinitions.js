/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
    SUC_MED_00005: {
        code: '200',
        message: 'Media content resolved successfully'
    },
    SUC_MED_00006: {
        code: '200',
        message: 'Media contexts resolved successfully'
    },
    SUC_MED_00007: {
        code: '200',
        message: 'Media folder policy saved successfully'
    },
    SUC_MED_00008: {
        code: '200',
        message: 'Media folder policy activated successfully'
    },
    SUC_MED_00009: {
        code: '200',
        message: 'Media folder policy deactivated successfully'
    },
    SUC_MED_00010: {
        code: '200',
        message: 'Media format policy saved successfully'
    },
    SUC_MED_00011: {
        code: '200',
        message: 'Media format policy activated successfully'
    },
    SUC_MED_00012: {
        code: '200',
        message: 'Media format policy deactivated successfully'
    },
    SUC_MED_00013: {
        code: '200',
        message: 'Media set entry added successfully'
    },
    SUC_MED_00014: {
        code: '200',
        message: 'Media set entry updated successfully'
    },
    SUC_MED_00015: {
        code: '200',
        message: 'Media set entry removed successfully'
    },
    SUC_MED_00016: {
        code: '200',
        message: 'Media set entries reordered successfully'
    },
    SUC_MED_00017: {
        code: '200',
        message: 'Primary media set entry updated successfully'
    },
    SUC_MED_00018: {
        code: '200',
        message: 'Media storage provider summary resolved successfully'
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
    },
    ERR_MED_00012: {
        code: '404',
        message: 'Media content is unavailable'
    },
    ERR_MED_00013: {
        code: '500',
        message: 'Media format policy runtime configuration is unavailable'
    },
    ERR_MED_00014: {
        code: '400',
        message: 'Invalid media set entry'
    },
    ERR_MED_00015: {
        code: '500',
        message: 'Media set entry service is unavailable'
    },
    ERR_MED_00016: {
        code: '404',
        message: 'Media set is unavailable'
    },
    ERR_MED_00017: {
        code: '400',
        message: 'Invalid media set entry policy'
    },
    ERR_MED_00018: {
        code: '409',
        message: 'Media set entry already exists'
    }
};
