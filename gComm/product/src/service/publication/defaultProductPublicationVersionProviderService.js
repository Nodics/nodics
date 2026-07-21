/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/service/publication/DefaultProductPublicationVersionProviderService @description Connects nPublish to a distinct non-versioned Online Product runtime. @layer service @owner product */
module.exports = {
    /** Initializes the version provider. */ init: function () { return Promise.resolve(true); },
    /** Completes provider initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns Product publication configuration. */ config: function () { return (CONFIG.get('product') || {}).publication || {}; },
    /** Requires the versioned Staged role. */ assertStaged: function () { if (this.config().runtimeRole !== 'STAGED') throw new CLASSES.NodicsError('ERR_PRODUCT_00042', 'Product publication source requires a versioned Staged runtime'); },
    /** Resolves the configured distinct-target transport. */ transport: function () { let name = this.config().targetTransportProvider; if (!name || !SERVICE[name]) throw new CLASSES.NodicsError('ERR_PRODUCT_00043', 'Product Online target transport is unavailable'); return SERVICE[name]; },
    /** Loads the exact source root. */ getVersion: function (publication, request) { this.assertStaged(); return SERVICE.DefaultProductPublicationAdapterService.getVersion(publication, request); },
    /** Reads the active Online version. */ getOnlineVersion: async function (publication, request) { this.assertStaged(); let root = await this.getVersion(publication, request); return this.transport().getStatus({ scope: { enterpriseCode: root.enterpriseCode, catalogCode: root.catalogCode } }, request); },
    /** Builds and deploys the immutable manifest. */ activate: async function (publication, request) { this.assertStaged(); let manifest = await SERVICE.DefaultProductPublicationManifestService.persist(publication, request); return this.transport().deploy({ manifest: manifest }, request); },
    /** Requests rollback to a previously accepted Online manifest. */ rollback: async function (publication, targetVersion, request) { this.assertStaged(); if (!targetVersion) throw new CLASSES.NodicsError('ERR_PRODUCT_00044', 'Previous Product Online release is unavailable'); let root = await this.getVersion(publication, request); return this.transport().rollback({ manifestCode: targetVersion, enterpriseCode: root.enterpriseCode, catalogCode: root.catalogCode }, request); }
};
