/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

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
        active: true
    }
};
