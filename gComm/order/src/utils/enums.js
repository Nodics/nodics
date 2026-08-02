/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/utils/enums
 * @description Order enum definitions, including reason categories for order, payment, and shipment lifecycle reasons.
 * @layer data
 * @owner order
 * @override Project modules may contribute additional enum definitions or override enum metadata through later module contributions.
 */
module.exports = {
    ReasonType: {
        _options: {
            name: 'ReasonType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'ORDERSTATUS',
            'PAYMENT',
            'SHIPMENT'
        ]
    }
};
