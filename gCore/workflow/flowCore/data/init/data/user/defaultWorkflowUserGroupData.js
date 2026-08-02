/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/data/init/data/user/defaultWorkflowUserGroupData
 * @description Provides workflow initializer or sample data consumed by the import layer.
 * @layer data
 * @owner workflow
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    record0: {
        code: 'workflowUserGroup',
        name: 'workflowUserGroup',
        active: true,
        parentGroups: ['employeeUserGroup']
    },
    record1: {
        code: 'workflowCreaterGroup',
        name: 'workflowCreaterGroup',
        active: true,
        parentGroups: ['workflowUserGroup']
    },
    record2: {
        code: 'workflowApproverGroup',
        name: 'workflowApproverGroup',
        active: true,
        parentGroups: ['workflowUserGroup']
    }
};