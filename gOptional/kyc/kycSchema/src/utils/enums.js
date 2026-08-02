/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gOptional/kyc/kycSchema/src/utils/enums
 * @description Provides shared kyc utility exports for enums.
 * @layer utils
 * @owner kyc
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    KYCType: {
        _options: {
            name: 'KYCType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'MOBILE',
            'EMAIL',
            'DOCS'
        ]
    },
    OPSType: {
        _options: {
            name: 'OPSType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'CUST_REG',
            'EMP_REG',
            'ORDER'
        ]
    }
};