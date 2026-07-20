/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module wcms/service/publication/DefaultWcmsPublicationWorkflowService
 * @description Bridges an approved existing WCMS carrier into the authoritative nPublish validation and target-deployment lifecycle.
 * @layer service
 * @owner wcms
 * @override Projects may replace carrier mapping while preserving approval-before-publish, item association, idempotency, and nPublish authority.
 */
module.exports = {
    /** Initializes the WCMS publication workflow bridge. */
    init: function () { return Promise.resolve(true); },
    /** Completes WCMS publication workflow initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Extracts the release request attached by the business user to the workflow carrier. */
    getPublication: function (request) {
        let carrier = request.workflowCarrier || {};
        let publication = carrier.sourceDetail && carrier.sourceDetail.publication;
        if (!publication) throw new CLASSES.NodicsError('CMS_PUBLICATION_WORKFLOW_INPUT_INVALID', 'Approved workflow carrier has no publication release definition');
        if (!Array.isArray(carrier.items) || carrier.items.length === 0) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_WORKFLOW_INPUT_INVALID', 'Approved workflow carrier has no associated content items');
        }
        return Object.assign({}, publication, { workflowRef: carrier.code,
            associatedItems: carrier.items.map(item => typeof item === 'object' ? {
                schema: item.schemaName || carrier.sourceDetail.schemaName,
                code: item.code || item._id,
                version: item.versionId === undefined ? undefined : String(item.versionId),
                refId: item.refId
            } : { schema: carrier.sourceDetail.schemaName, code: item }) });
    },
    /** Idempotently resumes validation and deployment after the manual workflow approval succeeds. */
    publish: async function (request) {
        let publication = this.getPublication(request);
        let context = { tenant: request.tenant, authData: request.authData, correlationId: request.correlationId || request.workflowCarrier.code,
            reason: 'Approved by workflow ' + request.workflowCarrier.code, publication: publication };
        let online = await SERVICE.DefaultPublicationLifecycleService.publishApproved(context);
        return { decision: 'SUCCESS', type: 'SUCCESS', feedback: { publicationCode: online.code,
            targetVersion: online.targetVersion, state: online.state, workflowRef: request.workflowCarrier.code } };
    }
};
