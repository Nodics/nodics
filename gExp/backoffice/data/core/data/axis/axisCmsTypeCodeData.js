/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/data/core/data/axis/axisCmsTypeCodeData
 * @description Declares non-executable Axis page and component property contracts.
 * @layer data
 * @owner backoffice
 */
module.exports = {
    record0: { code: 'axisAuthenticationPageType', kind: 'PAGE', contractVersion: 1, active: true },
    record1: { code: 'axisDashboardPageType', kind: 'PAGE', contractVersion: 1, active: true },
    record2: {
        code: 'axisBrandComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { productName: 'string', tagline: 'string', logoAsset: 'string', displayMode: 'string' },
        active: true
    },
    record3: {
        code: 'axisMessageComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { title: 'string', message: 'string', tone: 'string' },
        active: true
    },
    record4: {
        code: 'axisEmployeeLoginFormComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { title: 'string', usernameLabel: 'string', usernamePlaceholder: 'string',
            passwordLabel: 'string', passwordPlaceholder: 'string', submitLabel: 'string' },
        active: true
    },
    record5: {
        code: 'axisEmployeeRecoveryFormComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { title: 'string', identifierLabel: 'string', identifierPlaceholder: 'string',
            submitLabel: 'string', successMessage: 'string' },
        active: true
    },
    record6: {
        code: 'axisLinkComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { label: 'string', route: 'string' },
        active: true
    },
    record7: {
        code: 'axisDashboardSummaryComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { title: 'string', items: 'array', placeholder: 'boolean' },
        active: true
    },
    record8: {
        code: 'axisDashboardActionsComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { title: 'string', actions: 'array', placeholder: 'boolean' },
        active: true
    },
    record9: {
        code: 'axisAuthenticationShowcaseComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { eyebrow: 'string', title: 'string', message: 'string', highlights: 'array' },
        active: true
    },
    record10: {
        code: 'axisEmployeeLockFormComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { title: 'string', employeeLabel: 'string', passwordLabel: 'string',
            passwordPlaceholder: 'string', submitLabel: 'string', signOutLabel: 'string' },
        active: true
    },
    record11: { code: 'axisAssistantPageType', kind: 'PAGE', contractVersion: 1, active: true },
    record12: {
        code: 'axisAssistantWorkspaceComponentType', kind: 'COMPONENT', contractVersion: 1,
        propertySchema: { title: 'string', welcomeMessage: 'string', inputPlaceholder: 'string',
            submitLabel: 'string', stopLabel: 'string', emptyState: 'string',
            employeeLabel: 'string', assistantLabel: 'string', workingLabel: 'string',
            cancellingLabel: 'string', errorLabel: 'string', historyLabel: 'string',
            newConversationLabel: 'string', noConversationsLabel: 'string',
            loadMoreLabel: 'string', clarificationTitle: 'string',
            clarificationSubmitLabel: 'string', toolPlanTitle: 'string',
            confirmationTitle: 'string', approveLabel: 'string', rejectLabel: 'string',
            executeLabel: 'string', confirmationExpiredLabel: 'string',
            confirmationCompletedLabel: 'string', toolPlannedLabel: 'string',
            toolRunningLabel: 'string', toolSucceededLabel: 'string',
            toolFailedLabel: 'string', citationsTitle: 'string',
            noCitationsLabel: 'string', usageTitle: 'string',
            inputTokensLabel: 'string', outputTokensLabel: 'string',
            cachedTokensLabel: 'string', reasoningTokensLabel: 'string',
            embeddingTokensLabel: 'string', reconciliationLabel: 'string' }, active: true
    },
    record13: { code: 'axisSchemaWorkbenchPageType', kind: 'PAGE', contractVersion: 1, active: true },
    record14: {
        code: 'axisSchemaWorkbenchComponentType', kind: 'COMPONENT', contractVersion: 1,
        propertySchema: {
            title: 'string', introduction: 'string', schemaSearchLabel: 'string',
            schemaSearchPlaceholder: 'string', schemasLabel: 'string', recordsLabel: 'string',
            noSchemasLabel: 'string', noRecordsLabel: 'string', selectSchemaLabel: 'string',
            loadingLabel: 'string', retryLabel: 'string', createLabel: 'string',
            cancelLabel: 'string', savingLabel: 'string',
            selectExistingLabel: 'string', createRelatedLabel: 'string',
            addToDraftLabel: 'string', removeRelatedLabel: 'string',
            noRelatedRecordsLabel: 'string', relatedSearchLabel: 'string',
            actionsLabel: 'string', viewLabel: 'string', editLabel: 'string',
            updateLabel: 'string', updatingLabel: 'string', closeLabel: 'string',
            trueLabel: 'string', falseLabel: 'string',
            deleteLabel: 'string', deletingLabel: 'string',
            confirmDeleteLabel: 'string', deleteTitle: 'string',
            deleteWarning: 'string', tenantLabel: 'string', enterpriseLabel: 'string',
            searchRecordsLabel: 'string', searchRecordsPlaceholder: 'string',
            moduleLabel: 'string', availableOperationsLabel: 'string',
            resultsLabel: 'string', pageSizeLabel: 'string', paginationLabel: 'string',
            filterBuilderLabel: 'string', addConditionLabel: 'string',
            addGroupLabel: 'string', applyFiltersLabel: 'string',
            clearFiltersLabel: 'string',
            filterFieldLabel: 'string', filterOperatorLabel: 'string',
            filterValueLabel: 'string', filterMatchLabel: 'string',
            removeFilterLabel: 'string', requestPreviewLabel: 'string',
            addFavouriteLabel: 'string', removeFavouriteLabel: 'string',
            gridSettingsLabel: 'string', savedViewNameLabel: 'string',
            saveViewLabel: 'string', selectVisibleRecordsLabel: 'string',
            selectRecordLabel: 'string', selectedRecordsLabel: 'string',
            bulkDeleteLabel: 'string', bulkDeletingLabel: 'string',
            deleteImpactLoadingLabel: 'string', deleteImpactBlockedLabel: 'string',
            deleteImpactClearLabel: 'string', editRelatedLabel: 'string'
        },
        active: true
    }
};
