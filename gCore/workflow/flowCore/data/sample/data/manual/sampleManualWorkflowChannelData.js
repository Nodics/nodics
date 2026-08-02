/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/data/sample/data/manual/sampleManualWorkflowChannelData
 * @description Provides workflow initializer or sample data consumed by the import layer.
 * @layer data
 * @owner workflow
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    record1: {
        code: "manualOneChannel",
        name: "manualOneChannel",
        active: true,
        qualifier: {
            decision: 'manualOne'
        },
        target: 'manualActionOne'
    },
    record2: {
        code: "manualTwoChannel",
        name: "manualTwoChannel",
        active: true,
        qualifier: {
            decision: 'manualTwo'
        },
        target: 'manualActionTwo'
    }
};