/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nAuth/src/utils/statusDefinitions
 * @description Provides shared nAuth utility exports for status definitions.
 * @layer utils
 * @owner nAuth
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    SUC_AUTH_00000: {
        code: '200',
        message: 'Successfully authenticated',
    },
    SUC_AUTH_00001: {
        code: '200',
        message: 'Auth token generated successfully',
    },

    ERR_AUTH_00000: {
        code: '401',
        message: 'Authentication failed',
    },
    ERR_AUTH_00001: {
        code: '401',
        message: 'Invalid or expired authorization token',
    },
    ERR_AUTH_00002: {
        code: '401',
        message: 'Invalid authentication parameters'
    },
    ERR_AUTH_00003: {
        code: '403',
        message: 'Access denied'
    },

    ERR_LIN_00000: {
        code: '400',
        message: 'Invalid authentication parameters'
    },
    ERR_LIN_00002: {
        code: '401',
        message: 'Account is currently in locked state or has been disabled'
    },
    ERR_LIN_00003: {
        code: '400',
        message: 'Invalid authentication parameters'
    },

    ERR_ENT_00000: {
        code: '400',
        message: 'Invalid enterprise code'
    },
    ERR_ENT_00001: {
        code: '400',
        message: 'Invalid enterprise code'
    },

};
