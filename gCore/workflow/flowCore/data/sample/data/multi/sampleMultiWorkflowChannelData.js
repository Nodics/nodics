/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/data/sample/data/multi/sampleMultiWorkflowChannelData
 * @description Provides workflow initializer or sample data consumed by the import layer.
 * @layer data
 * @owner workflow
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    record1: {
        code: "multiOneChannel",
        name: "multiOneChannel",
        active: true,
        qualifier: {
            decision: 'MultiOne'
        },
        target: 'multiActionOne'
    },
    record2: {
        code: "multiTwoChannel",
        name: "multiTwoChannel",
        active: true,
        qualifier: {
            decision: 'MultiTwo'
        },
        target: 'multiActionTwo'
    },
    record3: {
        code: "multiSplitOneChannel",
        name: "multiSplitOneChannel",
        active: true,
        qualifier: {
            decision: 'SPLIT'
        },
        target: 'multiSplitActionOne'
    },
    record4: {
        code: "multiSplitTowChannel",
        name: "multiSplitTowChannel",
        active: true,
        qualifier: {
            decision: 'SPLIT'
        },
        target: 'multiSplitActionTwo'
    },
    record5: {
        code: "multiSplitTowRejectChannel",
        name: "multiSplitTowRejectChannel",
        active: true,
        qualifier: {
            decision: 'MultiSplitReject'
        },
        target: 'multiActionTwo'
    }
};