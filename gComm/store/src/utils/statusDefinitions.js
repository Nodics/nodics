/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module store/src/utils/statusDefinitions
 * @description Defines Store foundation validation, reference, identity, lifecycle, and retirement errors.
 * @layer utils
 * @owner store
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    ERR_STORE_00001: { code: '400', message: 'Authenticated enterprise context is required' },
    ERR_STORE_00002: { code: '403', message: 'Store enterprise scope mismatch' },
    ERR_STORE_00003: { code: '400', message: 'Invalid Store identity, classification, assignment, or effective date' },
    ERR_STORE_00004: { code: '409', message: 'Invalid Store or assignment lifecycle transition' },
    ERR_STORE_00005: { code: '400', message: 'Required Store or Inventory Warehouse reference is unavailable' },
    ERR_STORE_00006: { code: '409', message: 'Store or assignment identity is immutable' },
    ERR_STORE_00007: { code: '409', message: 'Store foundation records must be retired instead of deleted' },
    ERR_STORE_00008: { code: '409', message: 'Store has active Warehouse assignments and cannot be retired' }
};
