/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/data/init/header/defaultOrderStatusHeader
 * @description Initial-data import header for default order status records.
 * @layer data
 * @owner order
 * @override Project modules may supply later initializer headers or data rows to add or replace order statuses.
 */
module.exports = {
    order: {
        orderStatus: {
            options: {
                enabled: true,
                schemaName: 'orderstatus',
                operation: 'saveAll',
                //tenants: ['default'],
                dataFilePrefix: 'defaultOrderStatusData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
