/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/profile/src/event/listeners
 * @description Documents profile listeners module behavior.
 * @layer event
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    profile: {
        testListener: {
            event: 'testMe',
            listener: 'DefaultEventTestService.handleTestEvent'
        }
    }
};