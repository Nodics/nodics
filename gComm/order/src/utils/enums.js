/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
