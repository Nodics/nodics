/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nRouter/utils/statusDefinitions
 * @description Status and error definitions for router help, route governance, and override validation.
 * @layer data
 * @owner nRouter
 * @override Project modules may contribute additional router status definitions or localized messages through later modules.
 */
module.exports = {
    SUC_HLP_00000: {
        code: '200',
        message: 'Help notation successfully provided',
    },

    ERR_HLP_00000: {
        code: '500',
        message: 'Failed to serve help notation',
    },

    ERR_RTR_00003: {
        code: '400',
        message: 'Invalid router override definition',
    },

    ERR_RTR_00004: {
        code: '429',
        message: 'HTTP rate limit exceeded',
    }
};
