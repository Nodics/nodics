/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/service/publication/DefaultPricingPublicationVersionProviderService @description Connects nPublish to a distinct non-versioned Online Pricing runtime. @layer service @owner pricing */
module.exports = {
    /** Executes the init Pricing contract. */
    init: function () { return Promise.resolve(true); },
    /** Executes the postInit Pricing contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes the config Pricing contract. */
    config: function () { return (CONFIG.get('pricing') || {}).publication || {}; },
    /** Executes the assertStaged Pricing contract. */
    assertStaged: function () { if (this.config().runtimeRole !== 'STAGED') throw new CLASSES.NodicsError('ERR_PRICE_00052', 'Pricing publication source requires a versioned Staged runtime'); },
    /** Executes the transport Pricing contract. */
    transport: function () { let name = this.config().targetTransportProvider; if (!name || !SERVICE[name]) throw new CLASSES.NodicsError('ERR_PRICE_00053', 'Pricing Online target transport is unavailable'); return SERVICE[name]; },
    /** Executes the getVersion Pricing contract. */
    getVersion: function (publication, request) { this.assertStaged(); return SERVICE.DefaultPricingPublicationAdapterService.getVersion(publication, request); },
    /** Executes the asynchronous getOnlineVersion Pricing contract. */
    getOnlineVersion: async function (publication, request) { this.assertStaged(); let root = await this.getVersion(publication, request); return this.transport().getStatus({ scope: { enterpriseCode: root.enterpriseCode, priceListCode: root.priceListCode } }, request); },
    /** Executes the asynchronous activate Pricing contract. */
    activate: async function (publication, request) { this.assertStaged(); let manifest = await SERVICE.DefaultPricingPublicationManifestService.persist(publication, request); return this.transport().deploy({ manifest: manifest }, request); },
    /** Executes the rollback Pricing contract. */
    rollback: async function (publication, targetVersion, request) { this.assertStaged(); if (!targetVersion) throw new CLASSES.NodicsError('ERR_PRICE_00054', 'Previous Pricing Online release is unavailable'); let root = await this.getVersion(publication, request); return this.transport().rollback({ manifestCode: targetVersion, enterpriseCode: root.enterpriseCode, priceListCode: root.priceListCode }, request); }
};
