/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/src/utils/statusDefinitions
 * @description Defines inventory warehouse-foundation validation and lifecycle error responses.
 * @layer utils
 * @owner inventory
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    SUC_INV_00001: { code: '200', message: 'Warehouse reference resolved' },
    SUC_INV_00002: { code: '200', message: 'Stock sourcing intent evaluated' },
    ERR_INV_00001: { code: '400', message: 'Authenticated enterprise context is required' },
    ERR_INV_00002: { code: '403', message: 'Inventory enterprise scope mismatch' },
    ERR_INV_00003: { code: '400', message: 'Invalid warehouse identity or classification' },
    ERR_INV_00004: { code: '409', message: 'Invalid warehouse lifecycle transition' },
    ERR_INV_00005: { code: '400', message: 'Invalid warehouse location hierarchy' },
    ERR_INV_00006: { code: '409', message: 'Warehouse or location identity is immutable' },
    ERR_INV_00007: { code: '409', message: 'Warehouse foundation records must be retired instead of deleted' },
    ERR_INV_00008: { code: '409', message: 'Warehouse has active locations and cannot be retired' },
    ERR_INV_00009: { code: '404', message: 'Warehouse reference was not found or is unavailable' },
    ERR_INV_00010: { code: '403', message: 'Warehouse reference lookup requires an internal service identity' },
    ERR_INV_00011: { code: '400', message: 'Invalid stock identity, movement, Unit, or exact quantity' },
    ERR_INV_00012: { code: '409', message: 'Stock movement idempotency conflict' },
    ERR_INV_00013: { code: '409', message: 'Stock balance revision conflict' },
    ERR_INV_00014: { code: '409', message: 'Stock movement would create a forbidden negative balance' },
    ERR_INV_00015: { code: '503', message: 'Stock movement requires reconciliation after partial persistence' },
    ERR_INV_00016: { code: '400', message: 'Stock Pool or membership definition is invalid' },
    ERR_INV_00017: { code: '409', message: 'Stock Pool lifecycle transition is not allowed' },
    ERR_INV_00018: { code: '409', message: 'Stock Pool identity is immutable' },
    ERR_INV_00019: { code: '409', message: 'Stock Pool dependency is unavailable or active' },
    ERR_INV_00020: { code: '409', message: 'Stock Pool history cannot be deleted' },
    ERR_INV_00021: { code: '400', message: 'Stock sourcing policy or rule definition is invalid' },
    ERR_INV_00022: { code: '409', message: 'Stock sourcing lifecycle transition is not allowed' },
    ERR_INV_00023: { code: '409', message: 'Stock sourcing identity is immutable' },
    ERR_INV_00024: { code: '409', message: 'Stock sourcing dependency is unavailable or active' },
    ERR_INV_00025: { code: '409', message: 'Stock sourcing history cannot be deleted' },
    ERR_INV_00026: { code: '403', message: 'Stock sourcing intent requires an internal service identity' },
    ERR_INV_00027: { code: '400', message: 'Stock sourcing intent request is invalid or exceeds configured bounds' },
    ERR_INV_00028: { code: '503', message: 'Stock sourcing intent result exceeds the configured safe boundary' },
    SUC_INV_00003: { code: '200', message: 'Stock ON_HAND availability evaluated' },
    ERR_INV_00029: { code: '400', message: 'Stock availability request is invalid' },
    ERR_INV_00030: { code: '503', message: 'Stock availability evidence exceeds configured boundaries' },
    ERR_INV_00031: { code: '403', message: 'Stock availability requires an internal service identity' },
    SUC_INV_00004: { code: '200', message: 'Stock reservation operation completed' },
    ERR_INV_00032: { code: '400', message: 'Stock reservation request is invalid' },
    ERR_INV_00033: { code: '409', message: 'Insufficient available stock' },
    ERR_INV_00034: { code: '409', message: 'Stock reservation idempotency conflict' },
    ERR_INV_00035: { code: '409', message: 'Stock reservation lifecycle conflict' },
    ERR_INV_00036: { code: '503', message: 'Stock reservation requires reconciliation after partial persistence' },
    ERR_INV_00037: { code: '403', message: 'Stock reservation requires an internal service identity' },
    SUC_INV_00005: { code: '200', message: 'Stock allocation operation completed' },
    ERR_INV_00038: { code: '400', message: 'Stock allocation request is invalid' },
    ERR_INV_00039: { code: '409', message: 'Stock allocation idempotency conflict' },
    ERR_INV_00040: { code: '409', message: 'Stock allocation lifecycle conflict' },
    ERR_INV_00041: { code: '503', message: 'Stock allocation requires reconciliation' },
    ERR_INV_00042: { code: '403', message: 'Stock allocation requires an internal service identity' },
    SUC_INV_00006: { code: '200', message: 'Stock transfer operation completed' },
    ERR_INV_00043: { code: '400', message: 'Stock transfer request is invalid' },
    ERR_INV_00044: { code: '409', message: 'Stock transfer idempotency conflict' },
    ERR_INV_00045: { code: '409', message: 'Stock transfer lifecycle or quantity conflict' },
    ERR_INV_00046: { code: '503', message: 'Stock transfer requires reconciliation' },
    ERR_INV_00047: { code: '403', message: 'Stock transfer requires an internal service identity' },
    SUC_INV_00007: { code: '200', message: 'Inventory reconciliation operation completed' },
    ERR_INV_00048: { code: '400', message: 'Inventory reconciliation request is invalid' },
    ERR_INV_00049: { code: '409', message: 'Inventory reconciliation lifecycle conflict' },
    ERR_INV_00050: { code: '503', message: 'Inventory reconciliation boundary or repair failed' },
    ERR_INV_00051: { code: '403', message: 'Inventory reconciliation identity or permission is invalid' }
};
