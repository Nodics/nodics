/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module wcms/data/init/headers/schema2Workflow/defaultCmsComponent2Workflow
 * @description Import header for saving CMS component schema-to-workflow mappings.
 * @layer data
 * @owner wcms
 * @override Project modules may add later headers for custom component workflow bindings.
 */
module.exports = {
    cmsWorkflow: {
        defaultCmsComponent2Workflow: {
            options: {
                enabled: true,
                schemaName: 'workflow2Schema',
                operation: 'saveAll',
                dataFilePrefix: 'defaultCmsComponent2WorkflowData'
            },
            query: {
                workflowCode: '$workflowCode',
                schemaName: '$schemaName'
            }
        }
    }
};
