/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/src/service/storage/strategy/defaultTenantEnterpriseSchemaDateMediaKeyStrategyService
 * @description Generates tenant, enterprise, schema, date, and media-code
 * based provider-relative storage keys.
 * @layer service
 * @owner nMedia
 * @override Projects may replace this strategy or map folders to another
 * strategy while preserving safe provider-relative keys.
 */
module.exports = {

    /** Initializes the media storage key strategy service. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes the media storage key strategy service. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Builds `{purpose}/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}`.
     *
     * The `schema` segment comes from the caller-selected schema when supplied,
     * and otherwise falls back to folder purpose for generic media use cases.
     *
     * @param {Object} request Media request.
     * @param {Object} descriptor Validated descriptor.
     * @returns {string} Provider-relative storage key.
     */
    buildStorageKey: function (request, descriptor) {
        request = request || {};
        descriptor = descriptor || {};
        let date = request.date || new Date();
        let tenant = this.cleanSegment(request.tenant || 'default');
        let enterprise = this.cleanSegment(
            request.enterpriseCode ||
            (request.authData && request.authData.enterprise && request.authData.enterprise.code) ||
            'default'
        );
        let schema = this.cleanSegment(
            request.schemaName ||
            request.ownerSchema ||
            request.targetSchema ||
            descriptor.folder && descriptor.folder.code ||
            'general'
        );
        let purpose = SERVICE.DefaultMediaStorageKeyService.cleanPathPrefix(
            descriptor.folder && (descriptor.folder.storagePrefix || descriptor.folder.code) ||
            'utils'
        );
        let yyyy = String(date.getUTCFullYear());
        let mm = String(date.getUTCMonth() + 1).padStart(2, '0');
        let mediaCode = this.cleanSegment(request.mediaCode || request.code || SERVICE.DefaultMediaStorageKeyService.uuid());
        let extension = this.cleanSegment(descriptor.extension);
        return SERVICE.DefaultMediaStorageKeyService.assertSafeStorageKey([
            purpose,
            tenant,
            enterprise,
            schema,
            yyyy,
            mm,
            mediaCode + '.' + extension
        ].join('/'));
    },

    /**
     * Cleans one storage key segment.
     *
     * @param {string} value Raw segment.
     * @returns {string} Safe segment.
     */
    cleanSegment: function (value) {
        return SERVICE.DefaultMediaStorageKeyService.cleanSegment(value);
    }
};
