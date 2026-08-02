/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/data/init/header/defaultPaymentMethodHeader
 * @description Initial-data import header for governed Payment Method records.
 * @layer data
 * @owner payment
 * @override Customer modules may supply later initializer headers or data rows to add or replace payment methods.
 */
module.exports = {
    payment: {
        paymentMethod: {
            options: {
                enabled: true,
                schemaName: 'paymentmethod',
                operation: 'saveAll',
                dataFilePrefix: 'defaultPaymentMethodData',
            },
            query: {
                enterpriseCode: '$enterpriseCode',
                methodCode: '$methodCode',
            },
        },
    },
};
