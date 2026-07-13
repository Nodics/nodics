/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module order/data/init/header/defaultShippingStatusHeader
 * @description Initial-data import header for default shipping status records.
 * @layer data
 * @owner order
 * @override Project modules may supply later initializer headers or data rows to add or replace shipping statuses.
 */
module.exports = {
    order: {
        shippingStatus: {
            options: {
                enabled: true,
                schemaName: 'shippingstatus',
                operation: 'saveAll',
                //tenants: ['default'],
                dataFilePrefix: 'defaultShippingStatusData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
