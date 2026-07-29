/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');
const path = require('path');

/**
 * @module gFramework/nMedia/src/service/storage/defaultMediaStorageKeyService
 * @description Delegates provider-relative media storage key generation to the configured nMedia strategy.
 * @layer service
 * @owner nMedia
 * @override Later layers may replace or add key strategies while preserving traversal protection and backend authority.
 */
module.exports = {

    /** Initializes the media storage key service. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes the media storage key service. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Builds a safe provider-relative storage key.
     *
     * @param {Object} request Sanitized media descriptor.
     * @returns {string} Storage key.
     */
    buildStorageKey: function (request) {
        let descriptor = SERVICE.DefaultMediaStoragePolicyService.validateDescriptor(request);
        if (request && request.storageKey && request.trustedStorageKey === true) {
            return this.assertSafeStorageKey(request.storageKey);
        }
        if (SERVICE.DefaultMediaStorageKeyStrategyRegistryService &&
            typeof SERVICE.DefaultMediaStorageKeyStrategyRegistryService.buildStorageKey === 'function') {
            return this.assertSafeStorageKey(
                SERVICE.DefaultMediaStorageKeyStrategyRegistryService.buildStorageKey(request, descriptor)
            );
        }
        return this.buildFallbackStorageKey(request, descriptor);
    },

    /**
     * Builds the safe fallback key used only when the strategy registry is not active.
     *
     * @param {Object} request Sanitized media descriptor.
     * @param {Object} descriptor Validated media descriptor.
     * @returns {string} Safe storage key.
     */
    buildFallbackStorageKey: function (request, descriptor) {
        let folder = descriptor.folder || {};
        let date = request.date || new Date();
        let tenant = this.cleanSegment(request.tenant || 'default');
        let enterprise = this.cleanSegment(request.enterpriseCode || (request.authData && request.authData.enterprise && request.authData.enterprise.code) || 'default');
        let purpose = this.cleanSegment(folder.storagePrefix || folder.code || 'utils');
        let schema = this.cleanSegment(request.schemaName || request.ownerSchema || request.targetSchema || folder.code || 'general');
        let yyyy = String(date.getUTCFullYear());
        let mm = String(date.getUTCMonth() + 1).padStart(2, '0');
        let id = request.mediaCode || request.code || this.uuid();
        let storedFileName = this.cleanSegment(id) + '.' + descriptor.extension;
        return this.assertSafeStorageKey([purpose, tenant, enterprise, schema, yyyy, mm, storedFileName].join('/'));
    },

    /**
     * Returns a generated UUID.
     *
     * @returns {string} UUID-like identifier.
     */
    uuid: function () {
        return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
    },

    /**
     * Cleans one path segment.
     *
     * @param {string} value Raw segment.
     * @returns {string} Safe segment.
     */
    cleanSegment: function (value) {
        let segment = String(value || 'default').replace(/[^a-zA-Z0-9._-]/g, '-');
        return segment || 'default';
    },

    /**
     * Validates that a storage key is provider-relative and traversal-safe.
     *
     * @param {string} storageKey Storage key.
     * @returns {string} Safe storage key.
     */
    assertSafeStorageKey: function (storageKey) {
        let key = String(storageKey || '').replace(/\\/g, '/');
        if (!key || key.startsWith('/') || key.includes('://') || key.split('/').some(segment => segment === '..' || segment === '.')) {
            throw new CLASSES.NodicsError('ERR_MED_00004', 'Unsafe media storage key');
        }
        let normalized = path.posix.normalize(key);
        if (normalized.startsWith('../') || normalized === '..' || normalized.startsWith('/')) {
            throw new CLASSES.NodicsError('ERR_MED_00004', 'Unsafe media storage key');
        }
        return normalized;
    }
};
