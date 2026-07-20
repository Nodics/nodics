/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nPublish/src/utils/enums.js
 * @description Provides shared publish enum definition exports.
 * @layer utils
 * @owner publish
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    PublicationState: {
        _options: {
            name: 'PublicationState', separator: '|', endianness: 'BE', ignoreCase: false, freez: false
        },
        definition: [
            'STAGED', 'VALIDATING', 'VALIDATED', 'PENDING_APPROVAL', 'APPROVED',
            'REJECTED', 'ACTIVATING', 'ONLINE', 'ROLLING_BACK', 'ROLLED_BACK', 'FAILED'
        ]
    }
};
