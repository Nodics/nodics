/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nMedia/src/service/reference/defaultMediaReferenceLookupService
 * @description Provides a bounded nMedia-owned reference validation contract for domain modules.
 * @layer service
 * @owner nMedia
 * @override Later layers may extend projection details while preserving nMedia ownership of media item and media set lifecycle.
 */
module.exports = {
    /** Initializes media reference lookup. */ init: function () { return Promise.resolve(true); },
    /** Completes media reference lookup initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns effective reference lookup configuration. */
    policy: function () { return ((CONFIG.get('media') || {}).referenceLookup) || {}; },
    /** Extracts generated-service result items. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Validates remote route use is restricted to module identities. */
    validateServiceIdentity: function (request) {
        if (this.policy().requireServiceToken !== false && (!request.authData || request.authData.tokenType !== 'service')) {
            throw new CLASSES.NodicsError('ERR_MED_00007', 'Media reference lookup requires an internal service identity');
        }
        return true;
    },
    /** Normalizes the reference type used by callers. */
    referenceType: function (input) {
        let type = String(input.referenceType || input.kind || '').toUpperCase();
        if (type === 'MEDIASET') type = 'MEDIA_SET';
        if (!['MEDIA', 'MEDIA_SET'].includes(type)) throw new CLASSES.NodicsError('ERR_MED_00007', 'Media reference type is invalid');
        return type;
    },
    /** Loads one active nMedia-owned reference without exposing generated CRUD authority. */
    loadReference: async function (request, type, code) {
        let policy = this.policy(), maximum = Math.max(2, Number(policy.maximumResults || 2));
        let service = type === 'MEDIA_SET' ? SERVICE.DefaultMediaSetService : SERVICE.DefaultMediaService;
        if (!service || typeof service.get !== 'function') throw new CLASSES.NodicsError('ERR_MED_00007', 'Media reference authority is unavailable');
        let statuses = type === 'MEDIA_SET' ? (policy.activeMediaSetStatuses || ['ACTIVE']) : (policy.activeMediaStatuses || ['READY', 'CONSUMED']);
        let response = await service.get({ tenant: request.tenant, authData: request.authData, query: { code: code, status: { $in: statuses } }, searchOptions: { limit: maximum } });
        let items = this.items(response).filter(item => item.code === code && statuses.includes(item.status));
        if (items.length !== 1) throw new CLASSES.NodicsError('ERR_MED_00008', 'Active media reference is missing or ambiguous');
        return items[0];
    },
    /** Returns a minimal projection safe for caller-module reference validation. */
    project: function (type, item) {
        if (type === 'MEDIA_SET') return { referenceType: type, code: item.code, mediaType: item.mediaType, businessPurpose: item.businessPurpose, status: item.status };
        return { referenceType: type, code: item.code, folderCode: item.folderCode, formatCode: item.formatCode, providerCode: item.providerCode, access: item.access, mimeType: item.mimeType, extension: item.extension, sizeBytes: item.sizeBytes, businessPurpose: item.businessPurpose, enterpriseCode: item.enterpriseCode, ownerType: item.ownerType, ownerReference: item.ownerReference, reusable: item.reusable === true, retentionUntil: item.retentionUntil, legalHold: item.legalHold === true, status: item.status };
    },
    /** Performs local reference validation for co-hosted modules. */
    validateInternal: async function (request) {
        request = request || {};
        let input = request.body || request, type = this.referenceType(input), code = input.referenceCode || input.code;
        if (!code) throw new CLASSES.NodicsError('ERR_MED_00007', 'Media reference code is required');
        return this.project(type, await this.loadReference(request, type, code));
    },
    /** Validates a purpose-bound media reference without exposing storage paths or delivery URLs. */
    validatePurposeBound: async function (request) {
        let input = request.body || request, projection = await this.validateInternal(Object.assign({}, request, { body: { referenceType: 'MEDIA', referenceCode: input.mediaCode || input.referenceCode } }));
        if (input.requiredAccess && projection.access !== input.requiredAccess) throw new CLASSES.NodicsError('ERR_MED_00007', 'Media access does not satisfy the purpose-bound policy');
        if (input.businessPurpose && projection.businessPurpose !== input.businessPurpose && projection.folderCode !== input.businessPurpose) throw new CLASSES.NodicsError('ERR_MED_00007', 'Media purpose does not satisfy the owner policy');
        if (input.enterpriseCode && projection.enterpriseCode && projection.enterpriseCode !== input.enterpriseCode) throw new CLASSES.NodicsError('ERR_MED_00007', 'Media enterprise scope does not satisfy the owner policy');
        if (input.allowedMimeTypes && !input.allowedMimeTypes.includes(projection.mimeType)) throw new CLASSES.NodicsError('ERR_MED_00007', 'Media MIME type does not satisfy the owner policy');
        if (input.maximumSizeBytes && Number(projection.sizeBytes || 0) > Number(input.maximumSizeBytes)) throw new CLASSES.NodicsError('ERR_MED_00007', 'Media size exceeds the owner policy');
        if (projection.retentionUntil && new Date(projection.retentionUntil).getTime() <= Date.now()) throw new CLASSES.NodicsError('ERR_MED_00008', 'Media retention period has expired');
        if (input.ownerReference && projection.ownerReference && projection.ownerReference !== input.ownerReference && projection.reusable !== true) throw new CLASSES.NodicsError('ERR_MED_00007', 'Media reuse is not allowed for this owner');
        return projection;
    },
    /** Validates remote service identity and returns a bounded media reference result. */
    validate: async function (request) {
        this.validateServiceIdentity(request);
        return { code: 'SUC_MED_00003', data: await this.validateInternal(request) };
    }
};
