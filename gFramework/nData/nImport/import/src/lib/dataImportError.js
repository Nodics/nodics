/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/src/lib/dataImportError
 * @description Provides reusable nData library primitives for data import error.
 * @layer lib
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = class DataImportError extends CLASSES.NodicsError {
    constructor(error, message, defaultCode = CONFIG.get('defaultErrorCodes').DataImportError) {
        super(error, message, defaultCode);
        super.name = 'DataImportError';
    }
};