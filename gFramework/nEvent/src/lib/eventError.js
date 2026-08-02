/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nEvent/src/lib/eventError
 * @description Provides reusable nEvent library primitives for event error.
 * @layer lib
 * @owner nEvent
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = class EventError extends CLASSES.NodicsError {
    constructor(error, message, defaultCode = CONFIG.get('defaultErrorCodes').EventError) {
        super(error, message, defaultCode);
        super.name = 'EventError';
    }
};