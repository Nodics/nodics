/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/data/init/data/workflows/defaultWorkflowChannelData
 * @description Provides workflow initializer or sample data consumed by the import layer.
 * @layer data
 * @owner workflow
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    record0: {
        code: "defaultSuccessChannel",
        name: "defaultSuccessChannel",
        active: true,
        qualifier: {
            decision: 'SUCCESS'
        },
        target: 'defaultSuccessAction'
    },
    record1: {
        code: "defaultRejectChannel",
        name: "defaultRejectChannel",
        active: true,
        qualifier: {
            decision: 'REJECT'
        },
        target: 'defaultRejectAction'
    },
    record2: {
        code: "defaultErrorChannel",
        name: "defaultErrorChannel",
        active: true,
        qualifier: {
            decision: 'ERROR'
        },
        target: 'defaultErrorAction'
    },
    record3: {
        code: "defaultSplitEndChannel",
        name: "defaultSplitEndChannel",
        active: true,
        qualifier: {
            decision: 'SPLITEND'
        },
        target: 'defaultSplitEndAction'
    }
};