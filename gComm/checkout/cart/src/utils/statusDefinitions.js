/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cart/utils/statusDefinitions
 * @description Cart status and error-code definitions used by services, pipelines, and API responses.
 * @layer data
 * @owner cart
 * @override Project modules may contribute additional cart status definitions or override messages through later module configuration.
 */
module.exports = {
    /**
         * Exception codes related to Database operations
         */
    SUC_ORD_00000: {
        code: '200',
        message: 'Operation successfully processed: Order created'
    },

    ERR_ORD_00000: {
        code: '500',
        message: 'Internal server error while creating order'
    },

    ERR_ORD_00001: {
        code: '500',
        message: 'Invalid order creation request'
    }
};
