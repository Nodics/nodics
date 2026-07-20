/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/service/publication/DefaultCmsPublicationTargetService
 * @description Imports, activates, reports, and rolls back immutable releases inside the independently deployed Online CMS target.
 * @layer service
 * @owner cms
 * @override Online project modules may replace target persistence while preserving integrity, idempotency, tenant, receipt, and pointer CAS contracts.
 */
module.exports = {
    /** Initializes target publication operations. */
    init: function () { return Promise.resolve(true); },
    /** Completes target publication initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Resolves target-local manifest orchestration. */
    manifests: function () { return SERVICE.DefaultCmsPublicationManifestOrchestrationService; },
    /** Preserves the Staged correlation identity across target request composition. */
    applyCorrelation: function (request, input, manifest) {
        request.correlationId = input && input.correlationId || manifest && manifest.correlationId ||
            request.correlationId || request.requestId;
        return request;
    },
    /** Rejects target mutations unless this process is explicitly the non-versioned Online runtime. */
    assertOnlineRuntime: function () {
        if (((CONFIG.get('cms') || {}).publication || {}).runtimeRole !== 'ONLINE') {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_TARGET_ROLE_INVALID', 'CMS publication target operations require a non-versioned Online runtime');
        }
        if (CONFIG.get('publishEnabled') === true) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_TARGET_VERSIONING_INVALID', 'Online CMS must not activate publish/version provider modules');
        }
    },
    /** Persists an idempotent target-local deployment receipt. */
    recordReceipt: async function (operation, manifest, result, request) {
        let code = operation + '_' + manifest.code;
        let existing = await SERVICE.DefaultCmsPublicationDeploymentReceiptService.get({ tenant: request.tenant, authData: request.authData,
            query: { code: code }, searchOptions: { limit: 1 } });
        if (existing && Array.isArray(existing.result) && existing.result[0]) return existing.result[0];
        let model = { code: code, active: true, manifestCode: manifest.code, operation: operation, status: 'ONLINE',
            targetVersion: result.version, previousOnlineVersion: result.previousOnlineVersion,
            correlationId: request.correlationId || request.requestId };
        try {
            let response = await SERVICE.DefaultCmsPublicationDeploymentReceiptService.save({ tenant: request.tenant, authData: request.authData, model: model });
            return response && Array.isArray(response.result) ? response.result[0] : model;
        } catch (error) {
            let winner = await SERVICE.DefaultCmsPublicationDeploymentReceiptService.get({ tenant: request.tenant, authData: request.authData,
                query: { code: code }, searchOptions: { limit: 1 } });
            if (winner && Array.isArray(winner.result) && winner.result[0]) return winner.result[0];
            throw error;
        }
    },
    /** Imports a complete release before atomically switching its target-local Online pointer. */
    deploy: async function (request) {
        this.assertOnlineRuntime();
        let input = request.cmsPublicationTarget || request;
        if (!input.manifest) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_MISSING', 'CMS publication manifest is required');
        this.applyCorrelation(request, input, input.manifest);
        let policy = ((((CONFIG.get('cms') || {}).publication || {}).target) || {});
        let bytes = Buffer.byteLength(JSON.stringify(input.manifest), 'utf8');
        if (bytes > Number(policy.maxManifestBytes || 5242880)) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_BOUNDARY', 'CMS publication manifest exceeds target size policy');
        if (![].concat(policy.supportedContractVersions || [1]).includes(input.manifest.snapshot && input.manifest.snapshot.contractVersion)) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_CONTRACT_UNSUPPORTED', 'CMS publication manifest contract is unsupported by target');
        }
        let manifest = await this.manifests().importManifest(input.manifest, request);
        let result = await this.manifests().activate(manifest, request);
        await this.recordReceipt('DEPLOY', manifest, result, request);
        await SERVICE.DefaultCmsDeliveryCacheInvalidationService.invalidate(request);
        return result;
    },
    /** Returns target-local Online release status for one delivery scope. */
    getStatus: async function (request) {
        this.assertOnlineRuntime();
        let input = request.cmsPublicationTarget || request;
        this.applyCorrelation(request, input);
        let pointer = await this.manifests().getPointer(input.scope || {}, request);
        return pointer && { version: pointer.manifestCode, previousOnlineVersion: pointer.previousManifestCode };
    },
    /** Restores a release already imported into this Online target. */
    rollback: async function (request) {
        this.assertOnlineRuntime();
        let input = request.cmsPublicationTarget || request;
        let manifest = await this.manifests().getManifest(input.manifestCode, request);
        if (!manifest) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_MISSING', 'Rollback manifest is not deployed on the Online target');
        this.applyCorrelation(request, input, manifest);
        let result = await this.manifests().activate(manifest, request);
        await this.recordReceipt('ROLLBACK', manifest, result, request);
        await SERVICE.DefaultCmsDeliveryCacheInvalidationService.invalidate(request);
        return result;
    }
};
