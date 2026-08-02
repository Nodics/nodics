/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nData/nExport/export/src/utils/statusDefinitions.js
 * @description Provides shared export status and error definition exports.
 * @layer utils
 * @owner export
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    ERR_EXP_00001: {
        code: '400',
        message: 'Data export request is invalid or required export dependencies are unavailable',
    },
};
