/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
