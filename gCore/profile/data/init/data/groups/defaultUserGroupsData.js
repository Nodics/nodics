/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module profile/data/init/DefaultUserGroupsData
 * @description Seeds the default user-group hierarchy and narrowly scoped administrative permissions required by profile and control-plane capabilities.
 * @layer data
 * @owner profile
 * @override Project modules may extend or replace group assignments through layered data while preserving explicit permissions and least privilege.
 */
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'adminGroup',
        name: 'adminGroup',
        active: true,
        parentGroups: ['userGroup']
    },
    record1: {
        code: 'userGroup',
        name: 'userGroup',
        active: true
    },
    record2: {
        code: 'employeeUserGroup',
        name: 'employeeUserGroup',
        active: true,
        parentGroups: ['userGroup']
    },
    record3: {
        code: 'customerUserGroup',
        name: 'customerUserGroup',
        active: true,
        parentGroups: ['userGroup']
    },
    record4: {
        code: 'contentUserGroup',
        name: 'contentUserGroup',
        active: true,
        parentGroups: ['employeeUserGroup']
    },
    record5: {
        code: 'contentCreatorUserGroup',
        name: 'contentCreatorUserGroup',
        active: true,
        parentGroups: ['contentUserGroup']
    },
    record6: {
        code: 'contentApproverUserGroup',
        name: 'contentApproverUserGroup',
        active: true,
        parentGroups: ['contentUserGroup']
    },
    record7: {
        code: 'runtimeConfigViewerUserGroup',
        name: 'runtimeConfigViewerUserGroup',
        active: true,
        parentGroups: ['employeeUserGroup'],
        permissions: [
            'runtime.config.history.view',
            'runtime.config.summary.view',
            'runtime.config.request.view',
            'system.contract.openapi.view',
            'backoffice.registry.view',
            'backoffice.bootstrap.view'
        ]
    },
    record8: {
        code: 'runtimeConfigRequesterUserGroup',
        name: 'runtimeConfigRequesterUserGroup',
        active: true,
        parentGroups: ['runtimeConfigViewerUserGroup'],
        permissions: [
            'runtime.config.preview',
            'runtime.config.request.create'
        ]
    },
    record9: {
        code: 'runtimeConfigApproverUserGroup',
        name: 'runtimeConfigApproverUserGroup',
        active: true,
        parentGroups: ['runtimeConfigViewerUserGroup'],
        permissions: [
            'runtime.config.request.approve',
            'runtime.config.request.reject'
        ]
    },
    record10: {
        code: 'runtimeConfigOperatorUserGroup',
        name: 'runtimeConfigOperatorUserGroup',
        active: true,
        parentGroups: ['runtimeConfigRequesterUserGroup'],
        permissions: [
            'runtime.config.request.activate',
            'runtime.config.rollback',
            'runtime.config.cleanup.preview'
        ]
    },
    record11: {
        code: 'runtimeConfigAdminUserGroup',
        name: 'runtimeConfigAdminUserGroup',
        active: true,
        parentGroups: [
            'runtimeConfigOperatorUserGroup',
            'runtimeConfigApproverUserGroup'
        ],
        permissions: [
            'runtime.config.cleanup.execute',
            'identity.migration.preview',
            'identity.migration.apply',
            'identity.migration.rollback',
            'identity.credential.rotate',
            'cache.flush',
            'cache.configuration.router.update',
            'cache.configuration.item.update',
            'system.file.read',
            'system.file.download',
            'system.log.level.update',
            'system.schema.index.rebuild',
            'system.schema.validator.rebuild',
            'system.test.unit.run',
            'system.test.nodics.run',
            'import.init.run',
            'import.core.run',
            'import.sample.run',
            'import.local.run',
            'export.run',
            'dynamo.class.view',
            'dynamo.class.snapshot.view',
            'dynamo.class.update',
            'dynamo.class.execute',
            'backoffice.registry.diagnostics.view'
        ]
    },
    record12: {
        code: 'serviceAccountUserGroup',
        name: 'serviceAccountUserGroup',
        active: true,
        parentGroups: ['userGroup'],
        permissions: [
            'auth.internal.token.read',
            'auth.internal.token.read.anyTenant'
        ]
    }
};
