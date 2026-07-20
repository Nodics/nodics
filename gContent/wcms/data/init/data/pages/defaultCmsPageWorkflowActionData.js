/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module wcms/data/init/data/pages/defaultCmsPageWorkflowActionData
 * @description Seed workflow action data for manual CMS page review decisions.
 * @layer data
 * @owner wcms
 * @override Project modules may override or extend page workflow actions through later initializer data.
 */
module.exports = {
    record1: {
        code: "reviewCmsPageAction",
        name: "reviewCmsPageAction",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS', 'REJECT', 'ERROR'],
        channels: ['publishCmsPageChannel', 'defaultRejectChannel', 'defaultErrorChannel']
    },
    record2: {
        code: 'publishCmsPageAction',
        name: 'publishCmsPageAction',
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultWcmsPublicationWorkflowService.publish',
        accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS', 'ERROR'],
        channels: ['defaultSuccessChannel', 'defaultErrorChannel']
    }
};
