/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/src/controller/storage/defaultMediaStorageController
 * @description Exposes nMedia storage policy and location controller operations.
 * @layer controller
 * @owner nMedia
 * @override Later layers may add upload endpoints after nMedia-owned multipart intake exists.
 */
module.exports = {
    /**
     * Initializes the media storage controller.
     *
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function () {
        return Promise.resolve(true);
    },
    /**
     * Finalizes the media storage controller.
     *
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function () {
        return Promise.resolve(true);
    },
    /**
     * Resolves the upload policy for a media folder.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Policy response or callback result.
     */
    resolveStoragePolicy: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, {
            tenant: request && request.tenant,
            authData: request && request.authData
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.resolveStoragePolicy(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.resolveStoragePolicy(input);
        }
    },
    /**
     * Lists safe backend-owned media source context metadata.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Context metadata response or callback result.
     */
    listMediaContexts: function (request, callback) {
        if (callback) {
            FACADE.DefaultMediaStorageFacade.listMediaContexts().then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.listMediaContexts();
        }
    },
    /**
     * Creates or updates a backend-owned media folder policy.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Folder policy response or callback result.
     */
    saveFolderPolicy: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = Object.assign({}, body, params, {
            tenant: request && request.tenant,
            authData: request && request.authData
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.saveFolderPolicy(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.saveFolderPolicy(input);
        }
    },
    /**
     * Creates a backend-owned media folder policy.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Folder policy response or callback result.
     */
    createFolderPolicy: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, {
            create: true,
            tenant: request && request.tenant,
            authData: request && request.authData
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.saveFolderPolicy(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.saveFolderPolicy(input);
        }
    },
    /**
     * Activates a backend-owned media folder policy.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Folder policy response or callback result.
     */
    activateFolderPolicy: function (request, callback) {
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = {
            folderCode: params.folderCode,
            tenant: request && request.tenant,
            authData: request && request.authData
        };
        if (callback) {
            FACADE.DefaultMediaStorageFacade.activateFolderPolicy(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.activateFolderPolicy(input);
        }
    },
    /**
     * Deactivates a backend-owned media folder policy.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Folder policy response or callback result.
     */
    deactivateFolderPolicy: function (request, callback) {
        let params = request && request.httpRequest && request.httpRequest.params || {};
        let input = {
            folderCode: params.folderCode,
            tenant: request && request.tenant,
            authData: request && request.authData
        };
        if (callback) {
            FACADE.DefaultMediaStorageFacade.deactivateFolderPolicy(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.deactivateFolderPolicy(input);
        }
    },
    /**
     * Resolves a safe provider storage location for a media descriptor.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Location response or callback result.
     */
    resolveStorageLocation: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let input = Object.assign({}, body, {
            tenant: request && request.tenant,
            authData: request && request.authData
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.resolveStorageLocation(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.resolveStorageLocation(input);
        }
    },
    /**
     * Stores one nMedia-parsed media upload through nMedia.
     *
     * @param {Object} request Nodics request wrapper containing `httpRequest.files`.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} Upload response or callback result.
     */
    uploadMedia: function (request, callback) {
        let body = request && request.httpRequest && request.httpRequest.body || {};
        let files = request && request.httpRequest && request.httpRequest.files || [];
        let input = Object.assign({}, body, {
            tenant: request && request.tenant,
            authData: request && request.authData,
            files: files
        });
        if (callback) {
            FACADE.DefaultMediaStorageFacade.uploadMedia(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.uploadMedia(input);
        }
    },
    /**
     * Delivers authorized media content by media code.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} File response descriptor or callback result.
     */
    deliverMediaContent: function (request, callback) {
        let params = request && request.httpRequest && request.httpRequest.params || request && request.params || {};
        let query = request && request.httpRequest && request.httpRequest.query || request && request.query || {};
        let input = {
            tenant: request && request.tenant,
            authData: request && request.authData,
            params: params,
            query: query
        };
        if (callback) {
            FACADE.DefaultMediaStorageFacade.deliverMediaContent(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.deliverMediaContent(input);
        }
    },
    /**
     * Downloads authorized media content by media code.
     *
     * @param {Object} request Nodics request wrapper.
     * @param {Function} callback Optional callback used by router pipeline.
     * @returns {Promise<Object>|void} File response descriptor or callback result.
     */
    downloadMediaContent: function (request, callback) {
        let params = request && request.httpRequest && request.httpRequest.params || request && request.params || {};
        let query = request && request.httpRequest && request.httpRequest.query || request && request.query || {};
        let input = {
            tenant: request && request.tenant,
            authData: request && request.authData,
            params: params,
            query: query,
            download: true
        };
        if (callback) {
            FACADE.DefaultMediaStorageFacade.deliverMediaContent(input).then(success => callback(null, success)).catch(error => callback(error));
        } else {
            return FACADE.DefaultMediaStorageFacade.deliverMediaContent(input);
        }
    }
};
