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
    },
    ERR_ORD_00044: {
        code: '400',
        message: 'Order lifecycle request evidence is invalid'
    },
    ERR_ORD_00045: {
        code: '500',
        message: 'Order lifecycle request orchestration failed'
    },
    ERR_ORD_00046: {
        code: '409',
        message: 'Order lifecycle request state or version conflict'
    },
    ERR_ORD_00047: {
        code: '400',
        message: 'Order cancellation eligibility evidence is invalid'
    },
    ERR_ORD_00048: {
        code: '409',
        message: 'Order cancellation is not eligible under current policy'
    },
    ERR_ORD_00049: {
        code: '400',
        message: 'Order cancellation calculation evidence is invalid'
    },
    ERR_ORD_00050: {
        code: '500',
        message: 'Order cancellation calculation failed'
    },
    ERR_ORD_00051: {
        code: '500',
        message: 'Order cancellation Workflow evaluation failed'
    },
    ERR_ORD_00052: {
        code: '409',
        message: 'Order cancellation Workflow request version or state conflict'
    },
    ERR_ORD_00053: {
        code: '500',
        message: 'Order cancellation execution Pipeline failed'
    },
    ERR_ORD_00054: {
        code: '409',
        message: 'Order cancellation execution evidence requires reconciliation'
    },
    ERR_ORD_00055: { code: '400', message: 'Order cancellation intent is invalid' },
    ERR_ORD_00056: { code: '403', message: 'Order cancellation scope is forbidden' },
    ERR_ORD_00057: { code: '409', message: 'Order cancellation intent state conflicts with the operation' },
    ERR_ORD_00058: { code: '400', message: 'Order return validation evidence is invalid' },
    ERR_ORD_00059: { code: '409', message: 'Order return authorization is not permitted' },
    ERR_ORD_00060: { code: '500', message: 'Order return Workflow execution failed' },
    ERR_ORD_00061: { code: '409', message: 'Order return requires information or reconciliation' },
    ERR_ORD_00062: { code: '400', message: 'Order refund calculation evidence is invalid' },
    ERR_ORD_00063: { code: '409', message: 'Order refund approval is not permitted' },
    ERR_ORD_00064: { code: '502', message: 'Order refund execution failed' },
    ERR_ORD_00065: { code: '409', message: 'Order refund Workflow requires reconciliation' },
    ERR_ORD_00066: { code: '400', message: 'Order lifecycle intent is invalid' },
    ERR_ORD_00067: { code: '429', message: 'Order lifecycle request rate or review boundary exceeded' },
    ERR_ORD_00068: { code: '403', message: 'Order lifecycle diagnostics scope is forbidden' },
    ERR_ORD_00069: { code: '403', message: 'Order lifecycle policy or support scope is forbidden' },
    ERR_ORD_00070: { code: '400', message: 'Order lifecycle notification result is invalid' },
    ERR_ORD_00071: { code: '409', message: 'Order lifecycle policy management conflicts' },
    ERR_ORD_00072: { code: '409', message: 'Order Return outcome evidence is incomplete or conflicts with lifecycle state' }
};
