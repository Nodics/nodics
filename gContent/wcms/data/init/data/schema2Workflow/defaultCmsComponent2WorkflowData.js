/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
