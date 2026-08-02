/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nSystem/src/event/listeners
 * @description Documents nSystem listeners module behavior.
 * @layer event
 * @owner nSystem
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    common: {
        configurationChangeListener: {
            event: 'configurationSave',
            listener: 'DefaultConfigurationChangeListenerService.handleConfigurationChangeEvent'
        },
        configurationUpdateListener: {
            event: 'configurationUpdated',
            listener: 'DefaultConfigurationChangeListenerService.handleConfigurationChangeEvent'
        }
    }
};