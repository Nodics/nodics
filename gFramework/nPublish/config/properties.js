/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nPublish/config/properties
 * @description Reserved property contribution for publish/version promotion behavior.
 * @layer config
 * @owner nPublish
 * @override Project modules may provide later properties for customer publishing behavior.
 */
module.exports = {
    publish: {
        lifecycle: {
            initialState: 'STAGED',
            onlineState: 'ONLINE',
            terminalStates: ['ONLINE', 'ROLLED_BACK', 'REJECTED', 'FAILED'],
            transitions: {
                STAGED: ['VALIDATING'],
                VALIDATING: ['VALIDATED', 'FAILED'],
                VALIDATED: ['PENDING_APPROVAL', 'APPROVED'],
                PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
                APPROVED: ['ACTIVATING'],
                ACTIVATING: ['ONLINE', 'FAILED'],
                ONLINE: ['ROLLING_BACK'],
                ROLLING_BACK: ['ROLLED_BACK', 'FAILED']
            },
            maxDependencies: 10000,
            requireExpectedRevision: true
        },
        reconciliation: {
            batchSize: 100,
            maxDurationMs: 5000
        },
        providers: {
            domainAdapters: {},
            repositoryProvider: 'DefaultPublicationRepositoryService',
            versionProvider: null,
            versionProviders: {},
            workflowProvider: null
        },
        events: { activated: 'publicationActivated', rolledBack: 'publicationRolledBack', failed: 'publicationFailed' }
    }
};
