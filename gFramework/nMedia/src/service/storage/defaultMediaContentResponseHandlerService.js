/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nMedia/src/service/storage/defaultMediaContentResponseHandlerService
 * @description Sends nMedia-authorized binary content inline or as a download
 * without exposing provider paths to callers.
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
        if (this.isAttachment(success) && typeof response.download === 'function') {
            return response.download(
                success.filePath,
                this.safeHeaderFileName(success.fileName),
                this.handleTransferCallback(request, response)
            );
        }
        if (success.contentDisposition && response.set) {
            response.set('Content-Disposition', success.contentDisposition + '; filename="' + this.safeHeaderFileName(success.fileName) + '"');
        }
        response.sendFile(success.filePath, this.handleTransferCallback(request, response));
    },

    /**
     * Resolves whether the media response should be delivered as an attachment.
     *
     * @param {Object} success Delivery descriptor.
     * @returns {boolean} True when the response is a download.
     */
    isAttachment: function (success) {
        return String(success && success.contentDisposition || '').toLowerCase() === 'attachment';
    },

    /**
     * Builds an Express transfer callback that converts send/download failures
     * into a bounded JSON response instead of leaving the request open.
     *
     * @param {Object} request Express request.
     * @param {Object} response Express response.
     * @returns {Function} Express file-transfer callback.
     */
    handleTransferCallback: function (request, response) {
        return (error) => {
            if (!error) return;
            if (response.headersSent) {
                if (this.LOG && this.LOG.error) this.LOG.error(this.normalizeError(error));
                return;
            }
            this.handleError(request, response, error);
        };
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
        let normalizedError = this.normalizeError(error);
        if (this.LOG && this.LOG.error) this.LOG.error(normalizedError);
        response.status(this.resolveHttpStatus(normalizedError.responseCode));
        response.json(this.publicError(normalizedError));
    },

    /**
     * Normalizes media delivery errors without preserving circular internals.
     *
     * @param {Object|Error|string} error Delivery error.
     * @returns {Object} Nodics-compatible error object.
     */
    normalizeError: function (error) {
        if (typeof CLASSES !== 'undefined' && CLASSES && CLASSES.NodicsError && typeof CLASSES.NodicsError.ensure === 'function') {
            return CLASSES.NodicsError.ensure(error);
        }
        if (typeof CLASSES !== 'undefined' && CLASSES && CLASSES.NodicsError && !(error instanceof CLASSES.NodicsError)) {
            return new CLASSES.NodicsError(error);
        }
        return error || {};
    },

    /**
     * Builds the public JSON error envelope for media binary routes.
     *
     * @param {Object} error Normalized error.
     * @returns {Object} Safe public error response.
     */
    publicError: function (error) {
        if (typeof SERVICE !== 'undefined' && SERVICE && SERVICE.DefaultJsonResponseHandlerService &&
            typeof SERVICE.DefaultJsonResponseHandlerService.publicError === 'function') {
            return SERVICE.DefaultJsonResponseHandlerService.publicError(error);
        }
        return {
            responseCode: String(error.responseCode || '500'),
            code: error.code || error.defaultCode || 'ERR_SYS_00000',
            name: error.name || 'NodicsError',
            message: this.safeErrorMessage(error)
        };
    },

    /**
     * Resolves a valid HTTP status code from a Nodics response code.
     *
     * @param {string|number} value Response code.
     * @returns {number} HTTP status code.
     */
    resolveHttpStatus: function (value) {
        let status = Number(value);
        if (!Number.isInteger(status) || status < 100 || status > 599) return 500;
        return status;
    },

    /**
     * Resolves a bounded fallback error message.
     *
     * @param {Object} error Error object.
     * @returns {string} Safe error message.
     */
    safeErrorMessage: function (error) {
        if (error && typeof error.message === 'string' && error.message.length > 0) return error.message;
        return 'Media content request failed';
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
