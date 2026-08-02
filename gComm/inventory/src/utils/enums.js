/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module inventory/src/utils/enums
 * @description Provides stable inventory warehouse classifications for code-level consumers.
 * @layer utils
 * @owner inventory
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    InventoryWarehouseStatus: {
        definition: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED']
    },
    InventoryWarehouseType: {
        definition: [
            'PHYSICAL',
            'VIRTUAL',
            'STORE',
            'DARK_STORE',
            'DISTRIBUTION_CENTER',
            'SUPPLIER',
            'DROPSHIP',
            'RETURNS',
            'TRANSIT'
        ]
    },
    StockReservationState: {
        definition: ['PENDING', 'ACTIVE', 'RELEASE_PENDING', 'CONSUMED', 'RELEASED', 'EXPIRED', 'CANCELLED', 'REJECTED']
    },
    StockAllocationState: {
        definition: ['PENDING', 'ALLOCATED', 'PARTIALLY_ALLOCATED', 'BACKORDERED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'RELEASED', 'CANCELLED', 'FAILED']
    }
};
