/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
