/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module fulfillment/pipelines/pipelines @description Replaceable technical pipelines for Fulfillment-owned operations. @layer pipeline @owner fulfillment */
module.exports = {
    returnReceiptDispositionPipeline: {
        startNode: 'validateReceipt', hardStop: true, handleError: 'handleError',
        nodes: {
            validateReceipt: { type: 'function', handler: 'DefaultReturnReceiptDispositionService.validateReceipt', success: 'receiveReturn' },
            receiveReturn: { type: 'function', handler: 'DefaultReturnReceiptDispositionService.receiveReturn', success: 'inspectReturn' },
            inspectReturn: { type: 'function', handler: 'DefaultReturnReceiptDispositionService.inspectReturn', success: 'applyInventoryDisposition' },
            applyInventoryDisposition: { type: 'function', handler: 'DefaultReturnReceiptDispositionService.applyInventoryDisposition', success: 'closeReturn' },
            closeReturn: { type: 'function', handler: 'DefaultReturnReceiptDispositionService.closeReturn', success: 'successEnd' },
            successEnd: { type: 'function', handler: 'DefaultReturnReceiptDispositionService.handleSuccessEnd' },
            handleError: { type: 'function', handler: 'DefaultReturnReceiptDispositionService.handleErrorEnd' },
        },
    },
};
