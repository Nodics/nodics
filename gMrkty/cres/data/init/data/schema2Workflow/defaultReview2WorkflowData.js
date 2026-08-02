/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gMrkty/cres/data/init/data/schema2Workflow/defaultReview2WorkflowData
 * @description Provides cres initializer or sample data consumed by the import layer.
 * @layer data
 * @owner cres
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    record0: {
        workflowCode: 'customerReviewsWorkflow',
        schemaName: 'reviewTest',
        active: true,
        carrierType: 'FIXED',
        carrierDetail: {
            prefix: 'cr',
            code: 'workflow',
            postFix: 'carrier',
            isCarrierReleased: true
        },
        // sourceBuilder: {
        //     codeStrategy: {
        //         name: 'GROUPINTIME',
        //         params: {
        //             pattern: 'YYYY_MM_DD_00_MM_SS',
        //             delimiter: '_'
        //         }
        //     }
        // }
    },

    // record1: {
    //     workflowCode: 'multiWorkflow',
    //     schemaName: 'reviewTest',
    //     active: true,
    //     includeProperties: ['name', 'address.city'],
    //     carrierType: 'FIXED',
    //     carrierDetail: {
    //         prefix: 'cr',
    //         code: 'workflow',
    //         postFix: 'carrier',
    //         isCarrierReleased: false
    //     },
    //     sourceBuilder: {
    //         codeStrategy: {
    //             name: 'GROUPINTIME',
    //             params: {
    //                 pattern: 'YYYY_MM_DD_00_MM_SS',
    //                 delimiter: '_'
    //             }
    //         }
    //     }
    // }
};