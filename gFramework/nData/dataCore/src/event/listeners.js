/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nData/dataCore/src/event/listeners
 * @description Documents nData listeners module behavior.
 * @layer event
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    common: {
        importInterceptorUpdatedListener: {
            event: 'importInterceptorUpdated',
            listener: 'DefaultDataConfigurationService.handleImportInterceptorUpdated'
        },
        exportInterceptorUpdatedListener: {
            event: 'exportInterceptorUpdated',
            listener: 'DefaultDataConfigurationService.handleExportInterceptorUpdated'
        },
        importValidatorUpdatedListener: {
            event: 'importValidatorUpdated',
            listener: 'DefaultDataConfigurationService.handleImportValidatorUpdated'
        },
        exportValidatorUpdatedListener: {
            event: 'exportValidatorUpdated',
            listener: 'DefaultDataConfigurationService.handleExportValidatorUpdated'
        }
    }
};