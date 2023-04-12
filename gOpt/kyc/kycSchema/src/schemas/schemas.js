/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    kyc: {
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
                description: {
                    type: 'string',
                    required: false,
                    description: 'This could have detail description about the KYC model',
                },
                opsType: {
                    enum: [ENUMS.OPSType.CUST_REG.key, ENUMS.OPSType.EMP_REG.key, ENUMS.OPSType.ORDER.key],
                    required: true,
                    description: 'Required value could be only in [CUST_REG, EMP_REG, ORDER]'
                },
                type: {
                    enum: [ENUMS.KYCType.MOBILE.key, ENUMS.KYCType.EMAIL.key, ENUMS.KYCType.DOCS.key],
                    required: true,
                    description: 'Required value could be only in [MOBILE, EMAIL, DOCS]'
                }
            }
        }
    }
};