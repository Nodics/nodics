/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/utils/enums
 * @description Provides shared profile utility exports for enums.
 * @layer utils
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    AddressType: {
        _options: {
            name: 'AddressType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'EMAIL',
            'PHONE',
            'FAX',
            'PAGER'
        ]
    },
    ContactType: {
        _options: {
            name: 'ContactType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'EMAIL',
            'PHONE',
            'FAX',
            'PAGER'
        ]
    }
};