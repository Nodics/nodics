/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
