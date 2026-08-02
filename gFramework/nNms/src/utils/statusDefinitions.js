/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nNms/src/utils/statusDefinitions
 * @description Provides shared nNms utility exports for status definitions.
 * @layer utils
 * @owner nNms
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    SUC_RES_00000: {
        code: '200',
        message: 'Successfully processed',
    },
    SUC_RES_00001: {
        code: '200',
        message: 'Successfully granted responsibility',
    },

    ERR_RES_00000: {
        code: '400',
        message: 'Failed due to some internal error',
    },

    ERR_RES_00001: {
        code: '400',
        message: 'Rejected responsibility',
    }
};