/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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