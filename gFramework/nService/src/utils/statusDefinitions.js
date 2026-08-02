/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nService/utils/statusDefinitions
 * @description Shared tenant/service operation status and error definitions.
 * @layer data
 * @owner nService
 * @override Project modules may contribute additional service status definitions or localized messages through later modules.
 */
module.exports = {

    SUC_TNT_00000: {
        code: '200',
        message: 'Operation successfully processed'
    },
    SUC_TNT_00001: {
        code: '200',
        message: 'Operation partially processed'
    },

    ERR_TNT_00000: {
        code: '500',
        message: 'Operation internal server error'
    },
    ERR_TNT_00001: {
        code: '501',
        message: 'Operation not implemented'
    },
    ERR_TNT_00002: {
        code: '503',
        message: 'Operation unavailable currently'
    },
    ERR_TNT_00003: {
        code: '400',
        message: 'Invalid operation request'
    },
    ERR_TNT_00004: {
        code: '404',
        message: 'Operation not found'
    },
    ERR_TNT_00005: {
        code: '403',
        message: 'Operation not allowed'
    },
};
