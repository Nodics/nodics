/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcms/data/init/headers/schema2Workflow/defaultCmsPage2Workflow
 * @description Import header for saving CMS page schema-to-workflow mappings.
 * @layer data
 * @owner wcms
 * @override Project modules may add later headers for custom page workflow bindings.
 */
module.exports = {
    cmsWorkflow: {
        defaultCmsPage2Workflow: {
            options: {
                enabled: true,
                schemaName: 'workflow2Schema',
                operation: 'saveAll',
                dataFilePrefix: 'defaultCmsPage2WorkflowData'
            },
            query: {
                workflowCode: '$workflowCode',
                schemaName: '$schemaName'
            }
        }
    }
};
