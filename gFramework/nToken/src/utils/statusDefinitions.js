/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nToken/src/utils/statusDefinitions
 * @description Provides shared nToken utility exports for status definitions.
 * @layer utils
 * @owner nToken
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**
     * Exception codes related to Database operations
     */
    SUC_TKN_00000: {
        code: '200',
        message: 'Operation successfully processed: Token generated'
    },
    SUC_TKN_00001: {
        code: '200',
        message: 'Successfully validated Token'
    },

    ERR_TKN_00000: {
        code: '500',
        message: 'Internal server error while generating Token'
    },

    ERR_TKN_00001: {
        code: '500',
        message: 'Token expired'
    },

    ERR_TKN_00002: {
        code: '500',
        message: 'Token data is not valid'
    },

    ERR_TKN_00003: {
        code: '500',
        message: 'Invalid token'
    }
};