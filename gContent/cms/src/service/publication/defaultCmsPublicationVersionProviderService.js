/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/service/publication/DefaultCmsPublicationVersionProviderService
 * @description Implements the nPublish version-provider contract with CMS immutable manifests and atomic Online pointers.
 * @layer service
 * @owner cms
 * @override Projects may replace storage orchestration while preserving exact-version activation, idempotency, and rollback contracts.
 */
module.exports = {
    /** Initializes the CMS publication version provider. */
    init: function () { return Promise.resolve(true); },
    /** Completes CMS publication version provider initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Resolves the CMS-owned publication adapter. */
    adapter: function () { return SERVICE.DefaultCmsPublicationAdapterService; },
    /** Resolves the configured CMS manifest orchestration service. */
    manifests: function () {
        let name = ((CONFIG.get('cms') || {}).publication || {}).manifestService;
        if (!name || !SERVICE[name]) throw new CLASSES.NodicsError('CMS_PUBLICATION_SERVICE_UNAVAILABLE', 'CMS manifest orchestration is unavailable');
        return SERVICE[name];
    },
    /** Rejects source lifecycle operations outside the explicitly configured Staged runtime. */
    assertStagedRuntime: function () {
        if (((CONFIG.get('cms') || {}).publication || {}).runtimeRole !== 'STAGED') {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_SOURCE_ROLE_INVALID', 'CMS source publication requires a versioned Staged runtime');
        }
    },
    /** Resolves the configured transport to the independently deployed Online CMS target. */
    transport: function () {
        let name = ((CONFIG.get('cms') || {}).publication || {}).targetTransportProvider;
        if (!name || !SERVICE[name]) throw new CLASSES.NodicsError('CMS_PUBLICATION_TARGET_UNAVAILABLE', 'CMS Online target transport is unavailable');
        return SERVICE[name];
    },
    /** Loads the immutable root version selected by the publication request. */
    getVersion: function (publication, request) {
        this.assertStagedRuntime();
        return this.adapter().getVersion(publication, request);
    },
    /** Returns the currently active immutable manifest for the publication route scope. */
    getOnlineVersion: async function (publication, request) {
        this.assertStagedRuntime();
        let route = await this.getVersion(publication, request);
        return this.transport().getStatus({ scope: { site: route.site, path: route.path, locale: route.locale,
            channel: route.channel, accessMode: route.accessMode } }, request);
    },
    /** Builds an immutable manifest and atomically activates its Online pointer. */
    activate: async function (publication, request) {
        this.assertStagedRuntime();
        let manifest = await this.manifests().persist(publication, request);
        return this.transport().deploy({ manifest: manifest }, request);
    },
    /** Atomically restores a previously active immutable manifest. */
    rollback: async function (publication, targetVersion, request) {
        this.assertStagedRuntime();
        if (!targetVersion) throw new CLASSES.NodicsError('CMS_PUBLICATION_ROLLBACK_UNAVAILABLE', 'Previous CMS Online manifest is unavailable');
        return this.transport().rollback({ manifestCode: targetVersion }, request);
    }
};
