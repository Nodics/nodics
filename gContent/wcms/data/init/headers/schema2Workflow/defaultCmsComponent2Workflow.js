/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
