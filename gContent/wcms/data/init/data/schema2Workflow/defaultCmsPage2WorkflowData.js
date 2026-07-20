/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module wcms/data/init/data/schema2Workflow/defaultCmsPage2WorkflowData
 * @description Seed mapping that binds CMS page schemas to the default page approval workflow.
 * @layer data
 * @owner wcms
 * @override Project modules may provide later schema-to-workflow mappings for custom page governance.
 */
module.exports = {
    record0: {
        workflowCode: 'cmsPagesApprovalFlowHead',
        schemaName: 'cmsPage',
        carrierDetail: { isCarrierReleased: false },
        includeProperties: ['versionId'],
        active: true
    },
    record1: {
        workflowCode: 'cmsPagesApprovalFlowHead', schemaName: 'cmsPageRoute',
        carrierDetail: { isCarrierReleased: false }, includeProperties: ['versionId'], active: true
    },
    record2: {
        workflowCode: 'cmsPagesApprovalFlowHead', schemaName: 'cmsPageTemplate',
        carrierDetail: { isCarrierReleased: false }, includeProperties: ['versionId'], active: true
    },
    record3: {
        workflowCode: 'cmsPagesApprovalFlowHead', schemaName: 'cmsSlotDefinition',
        carrierDetail: { isCarrierReleased: false }, includeProperties: ['versionId'], active: true
    },
    record4: {
        workflowCode: 'cmsPagesApprovalFlowHead', schemaName: 'cmsSite',
        carrierDetail: { isCarrierReleased: false }, includeProperties: ['versionId'], active: true
    }
};
