/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcms/data/init/data/schema2Workflow/defaultCmsComponent2WorkflowData
 * @description Seed mapping that binds CMS component schemas to the default component approval workflow.
 * @layer data
 * @owner wcms
 * @override Project modules may provide later schema-to-workflow mappings for custom component governance.
 */
module.exports = {
    record0: {
        workflowCode: 'cmsComponentApprovalFlowHead',
        schemaName: 'cmsComponent',
        carrierDetail: { isCarrierReleased: false },
        includeProperties: ['versionId'],
        active: true
    },
    record1: {
        workflowCode: 'cmsComponentApprovalFlowHead', schemaName: 'cmsComponentDetail',
        carrierDetail: { isCarrierReleased: false }, includeProperties: ['versionId'], active: true
    },
    record2: {
        workflowCode: 'cmsComponentApprovalFlowHead', schemaName: 'cmsTypeCode',
        carrierDetail: { isCarrierReleased: false }, includeProperties: ['versionId'], active: true
    },
    record3: {
        workflowCode: 'cmsComponentApprovalFlowHead', schemaName: 'cmsTypeCode2Renderer',
        carrierDetail: { isCarrierReleased: false }, includeProperties: ['versionId'], active: true
    }
};
