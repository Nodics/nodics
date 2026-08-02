/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nPipeline/utils/statusDefinitions
 * @description Status and error definitions for pipeline execution and pipeline-definition validation.
 * @layer data
 * @owner nPipeline
 * @override Project modules may contribute additional pipeline status definitions or localized messages through later modules.
 */
module.exports = {

    SUC_PIPE_00000: {
        code: '200',
        message: 'Request successfully processed'
    },

    ERR_PIPE_00000: {
        code: '500',
        message: 'Invalid pipeline definition'
    },
};
