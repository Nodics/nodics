/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/src/service/storage/defaultMediaContentResponseHandlerService
 * @description Sends nMedia-authorized binary content inline without exposing
 * provider paths to callers.
 * @layer service
 * @owner nMedia
 * @override Projects may customize headers or streaming behavior while
 * preserving nMedia delivery authorization.
 */
module.exports = {

    /** Initializes the media content response handler. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes the media content response handler. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Sends authorized media content.
     *
     * @param {Object} request Express request.
     * @param {Object} response Express response.
     * @param {Object} success Delivery descriptor.
     * @returns {void}
     */
    handleSuccess: function (request, response, success) {
        if (success.mimeType && response.type) response.type(success.mimeType);
        if (success.cacheControl && response.set) response.set('Cache-Control', success.cacheControl);
        if (success.contentDisposition && response.set) {
            response.set('Content-Disposition', success.contentDisposition + '; filename="' + this.safeHeaderFileName(success.fileName) + '"');
        }
        response.sendFile(success.filePath);
    },

    /**
     * Sends media delivery errors as JSON.
     *
     * @param {Object} request Express request.
     * @param {Object} response Express response.
     * @param {Object} error Delivery error.
     * @returns {void}
     */
    handleError: function (request, response, error) {
        response.json(error);
    },

    /**
     * Sanitizes a filename for response header use.
     *
     * @param {string} value Filename.
     * @returns {string} Safe header filename.
     */
    safeHeaderFileName: function (value) {
        return String(value || 'media').replace(/["\r\n\\]/g, '-');
    }
};
