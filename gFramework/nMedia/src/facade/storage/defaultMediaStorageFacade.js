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
     * Returns safe operational storage-provider metadata.
     *
     * @param {Object} request Provider summary request.
     * @returns {Promise<Object>} Provider summary response.
     */
    summarizeStorageProviders: function (request) {
        return Promise.resolve({
            code: 'SUC_MED_00018',
            data: SERVICE.DefaultMediaStorageProviderRegistryService.summarizeProviders(request)
        });
    },
    /**
     * Creates or updates one effective media folder policy.
     *
     * @param {Object} request Folder policy mutation request.
     * @returns {Promise<Object>} Folder policy response.
     */
    saveFolderPolicy: function (request) {
        return Promise.resolve({
            code: 'SUC_MED_00007',
            data: SERVICE.DefaultMediaStoragePolicyService.saveFolderPolicy(request)
        });
    },
    /**
     * Activates one effective media folder policy.
     *
     * @param {Object} request Folder lifecycle request.
     * @returns {Promise<Object>} Folder policy response.
     */
    activateFolderPolicy: function (request) {
        return Promise.resolve({
            code: 'SUC_MED_00008',
            data: SERVICE.DefaultMediaStoragePolicyService.setFolderPolicyStatus(request, 'ACTIVE')
        });
    },
    /**
     * Deactivates one effective media folder policy.
     *
     * @param {Object} request Folder lifecycle request.
     * @returns {Promise<Object>} Folder policy response.
     */
    deactivateFolderPolicy: function (request) {
        return Promise.resolve({
            code: 'SUC_MED_00009',
            data: SERVICE.DefaultMediaStoragePolicyService.setFolderPolicyStatus(request, 'INACTIVE')
        });
    },
    /**
     * Creates or updates one effective media format policy.
     *
     * @param {Object} request Format policy mutation request.
     * @returns {Promise<Object>} Format policy response.
     */
    saveFormatPolicy: function (request) {
        return Promise.resolve({
            code: 'SUC_MED_00010',
            data: SERVICE.DefaultMediaStoragePolicyService.saveFormatPolicy(request)
        });
    },
    /**
     * Activates one effective media format policy.
     *
     * @param {Object} request Format lifecycle request.
     * @returns {Promise<Object>} Format policy response.
     */
    activateFormatPolicy: function (request) {
        return Promise.resolve({
            code: 'SUC_MED_00011',
            data: SERVICE.DefaultMediaStoragePolicyService.setFormatPolicyStatus(request, 'ACTIVE')
        });
    },
    /**
     * Deactivates one effective media format policy.
     *
     * @param {Object} request Format lifecycle request.
     * @returns {Promise<Object>} Format policy response.
     */
    deactivateFormatPolicy: function (request) {
        return Promise.resolve({
            code: 'SUC_MED_00012',
            data: SERVICE.DefaultMediaStoragePolicyService.setFormatPolicyStatus(request, 'INACTIVE')
        });
    },
    /**
     * Adds a media set entry through nMedia-owned set-entry operations.
     *
     * @param {Object} request Set-entry request.
     * @returns {Promise<Object>} Set-entry response.
     */
    addMediaSetEntry: function (request) {
        return Promise.resolve({
            code: 'SUC_MED_00013',
            data: SERVICE.DefaultMediaSetEntryManagementService.addEntry(request)
        });
    },
    /**
     * Updates a media set entry through nMedia-owned set-entry operations.
     *
     * @param {Object} request Set-entry request.
     * @returns {Promise<Object>} Set-entry response.
     */
    updateMediaSetEntry: function (request) {
        return Promise.resolve({
            code: 'SUC_MED_00014',
            data: SERVICE.DefaultMediaSetEntryManagementService.updateEntry(request)
        });
    },
    /**
     * Removes a media set entry through nMedia-owned set-entry operations.
     *
     * @param {Object} request Set-entry request.
     * @returns {Promise<Object>} Set-entry response.
     */
    removeMediaSetEntry: function (request) {
        return Promise.resolve({
            code: 'SUC_MED_00015',
            data: SERVICE.DefaultMediaSetEntryManagementService.removeEntry(request)
        });
    },
    /**
     * Reorders media set entries through nMedia-owned set-entry operations.
     *
     * @param {Object} request Set-entry reorder request.
     * @returns {Promise<Object>} Set-entry response.
     */
    reorderMediaSetEntries: function (request) {
        return Promise.resolve({
            code: 'SUC_MED_00016',
            data: SERVICE.DefaultMediaSetEntryManagementService.reorderEntries(request)
        });
    },
    /**
     * Marks one media set entry as primary.
     *
     * @param {Object} request Set-entry primary request.
     * @returns {Promise<Object>} Set-entry response.
     */
    setPrimaryMediaSetEntry: function (request) {
        return Promise.resolve({
            code: 'SUC_MED_00017',
            data: SERVICE.DefaultMediaSetEntryManagementService.setPrimaryEntry(request)
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
