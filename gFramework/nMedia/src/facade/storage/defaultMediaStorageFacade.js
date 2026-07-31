/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/src/facade/storage/defaultMediaStorageFacade
 * @description Delegates media storage policy and location operations.
 * @layer facade
 * @owner nMedia
 * @override Later layers may decorate facade behavior while preserving provider-neutral storage service ownership.
 */
module.exports = {
    /**
     * Initializes the media storage facade.
     *
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function () {
        return Promise.resolve(true);
    },
    /**
     * Finalizes the media storage facade.
     *
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function () {
        return Promise.resolve(true);
    },
    /**
     * Resolves safe upload policy metadata.
     *
     * @param {Object} request Media descriptor request.
     * @returns {Promise<Object>} Policy response.
     */
    resolveStoragePolicy: function (request) {
        let descriptor = SERVICE.DefaultMediaStoragePolicyService.validateDescriptor(request);
        return Promise.resolve({
            code: 'SUC_MED_00001',
            data: {
                folderCode: descriptor.folder.code,
                access: descriptor.folder.access,
                uploadPolicy: descriptor.uploadPolicy
            }
        });
    },
    /**
     * Lists safe backend-owned media source context metadata.
     *
     * @returns {Promise<Object>} Media context metadata response.
     */
    listMediaContexts: function () {
        return Promise.resolve({
            code: 'SUC_MED_00006',
            data: {
                contexts: SERVICE.DefaultMediaStoragePolicyService.listMediaContexts()
            }
        });
    },
    /**
     * Resolves a provider-neutral storage location descriptor.
     *
     * @param {Object} request Media descriptor request.
     * @returns {Promise<Object>} Location response.
     */
    resolveStorageLocation: function (request) {
        let location = SERVICE.DefaultMediaStorageProviderRegistryService.resolveLocation(request);
        delete location.internalAbsolutePath;
        return Promise.resolve({
            code: 'SUC_MED_00002',
            data: location
        });
    },
    /**
     * Delegates a parsed media upload to the upload service.
     *
     * @param {Object} request Parsed upload request.
     * @returns {Promise<Object>} Upload response.
     */
    uploadMedia: function (request) {
        return SERVICE.DefaultMediaUploadService.upload(request).then(media => ({
            code: 'SUC_MED_00004',
            data: media
        }));
    },
    /**
     * Resolves an authorized media content delivery descriptor.
     *
     * @param {Object} request Delivery request.
     * @returns {Promise<Object>} File response descriptor.
     */
    deliverMediaContent: function (request) {
        return SERVICE.DefaultMediaDeliveryService.deliver(request);
    }
};
