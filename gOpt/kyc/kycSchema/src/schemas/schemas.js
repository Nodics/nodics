/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    kycSchema: {
        kyc: {
            super: 'super',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: false
            },
            definition: {
                refId: {
                    type: 'string',
                    required: true,
                    description: 'This is unique reference from the source, loke loginId, orderId',
                },
                group: {
                    type: 'string',
                    required: false,
                    description: 'This will help to club type of KYCs like, order validation, initiated or customer registration',
                },
                type: {
                    enum: [ENUMS.KYCType.CUST_REG.key, ENUMS.KYCType.EMP_REG.key, ENUMS.KYCType.ORDER.key],
                    required: true,
                    description: 'Required value could be only in [CUST_REG, EMP_REG, ORDER]'
                }
            }
        }
    }
};