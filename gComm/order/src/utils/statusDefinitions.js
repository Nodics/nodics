/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/utils/statusDefinitions
 * @description Reserved order status and error-code definitions used by services, pipelines, and API responses.
 * @layer data
 * @owner order
 * @override Project modules may contribute order status definitions or override messages through later module configuration.
 */
module.exports = {
    ERR_ORD_00002: {
        code: '400',
        message: 'Checkout allocation request is invalid'
    },
    ERR_ORD_00020: {
        code: '500',
        message: 'Checkout placement pipeline could not complete'
    },
    ERR_ORD_00021: {
        code: '500',
        message: 'Checkout placement workflow could not complete'
    },
    ERR_ORD_00022: {
        code: '400',
        message: 'Checkout placement validation failed'
    },
    ERR_ORD_00023: {
        code: '409',
        message: 'Checkout inventory reservation failed'
    },
    ERR_ORD_00024: {
        code: '500',
        message: 'Checkout order projection failed'
    },
    ERR_ORD_00025: {
        code: '500',
        message: 'Checkout allocation copy failed'
    },
    ERR_ORD_00026: {
        code: '500',
        message: 'Checkout placement history update failed'
    },
    ERR_ORD_00027: {
        code: '500',
        message: 'Checkout placement completion failed'
    },
    ERR_ORD_00028: {
        code: '500',
        message: 'Checkout placement compensation failed'
    },
    ERR_ORD_00029: {
        code: '502',
        message: 'Checkout payment authorization handoff failed'
    },
    ERR_ORD_00030: {
        code: '502',
        message: 'Checkout fulfillment release handoff failed'
    },
    ERR_ORD_00031: {
        code: '500',
        message: 'Checkout reverse workflow could not complete'
    },
    ERR_ORD_00032: {
        code: '502',
        message: 'Checkout reverse return request handoff failed'
    },
    ERR_ORD_00033: {
        code: '502',
        message: 'Checkout reverse return approval handoff failed'
    },
    ERR_ORD_00034: {
        code: '502',
        message: 'Checkout reverse return receipt handoff failed'
    },
    ERR_ORD_00035: {
        code: '502',
        message: 'Checkout reverse refund handoff failed'
    },
    ERR_ORD_00036: {
        code: '500',
        message: 'Checkout reverse history update failed'
    },
    ERR_ORD_00037: {
        code: '409',
        message: 'Checkout reverse refund calculation failed'
    },
    ERR_ORD_00038: {
        code: '502',
        message: 'Checkout reverse return disposition handoff failed'
    },
    ERR_ORD_00039: {
        code: '502',
        message: 'Checkout reverse inventory disposition handoff failed'
    },
    ERR_ORD_00040: {
        code: '502',
        message: 'Checkout reverse payment recovery failed'
    },
    ERR_ORD_00041: {
        code: '500',
        message: 'Checkout reverse history recovery failed'
    },
    ERR_ORD_00042: {
        code: '502',
        message: 'Checkout reverse fulfillment recovery failed'
    },
    ERR_ORD_00043: {
        code: '502',
        message: 'Checkout reverse inventory recovery failed'
    }
};
