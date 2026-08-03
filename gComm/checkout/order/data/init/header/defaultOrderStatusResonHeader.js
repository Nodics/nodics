/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/data/init/header/defaultOrderStatusResonHeader
 * @description Initial-data import header for default order, payment, and shipment reason records.
 * @layer data
 * @owner order
 * @override Project modules may supply later initializer headers or data rows to add or replace status reasons.
 */
module.exports = {
    order: {
        orderStatusReasons: {
            options: {
                enabled: true,
                schemaName: 'reasons',
                operation: 'saveAll',
                //tenants: ['default'],
                dataFilePrefix: 'defaultOrderStatusResonData'
            }
        }
    }
};
