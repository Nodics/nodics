/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/src/utils/statusDefinitions
 * @description Provides shared nData utility exports for status definitions.
 * @layer utils
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    SUC_IMP_00000: {
        code: '200',
        message: 'Data successfully processed'
    },
    SUC_IMP_00001: {
        code: '200',
        message: 'Data partially processed'
    },

    ERR_IMP_00000: {
        code: '500',
        message: 'Operation internal server error'
    },
    ERR_IMP_00001: {
        code: '501',
        message: 'Operation not implemented'
    },
    ERR_IMP_00002: {
        code: '503',
        message: 'Operation unavailable currently'
    },
    ERR_IMP_00003: {
        code: '400',
        message: 'Invalid operation request'
    },
    ERR_IMP_00004: {
        code: '404',
        message: 'Operation not found'
    },
    ERR_IMP_00005: {
        code: '500',
        message: 'Could not execute pre interceptors or validators'
    },
    ERR_IMP_00006: {
        code: '500',
        message: 'Could not execute post interceptors or validators'
    },
    ERR_IMP_00007: {
        code: '400',
        message: 'Models not found'
    },
    ERR_IMP_00008: {
        code: '400',
        message: 'Invalid media import source request'
    },
    ERR_IMP_00009: {
        code: '400',
        message: 'Invalid media import definition request'
    },
    ERR_IMP_00010: {
        code: '400',
        message: 'Import completed with record-level errors'
    },
    ERR_IMP_00011: {
        code: '400',
        message: 'Import record is invalid for selected target model'
    },
    ERR_IMP_VALIDATE_00000: {
        code: '400',
        message: 'Import validation failed'
    },
    ERR_IMP_VALIDATE_00007: {
        code: '400',
        message: 'Finalized import file could not be read'
    },
    ERR_IMP_VALIDATE_00008: {
        code: '400',
        message: 'Import record is missing required data'
    }
};
