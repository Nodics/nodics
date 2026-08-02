/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module router/service/handlers/response/DefaultFileDownloadResponseHandlerService
 * @description Response handler for routes that return downloadable files instead of
 * JSON payloads.
 * @layer service
 * @owner nRouter
 * @override Project modules may override this handler through router configuration to
 * enforce file authorization, custom headers, streaming, or audit behavior.
 *
 * @property {Object} success.filePath Absolute or runtime-resolvable file path to download.
 * @property {Object} success.fileName Optional public download filename.
 * @property {Object} success.mimeType Optional response MIME type.
 * @property {Object} success.cacheControl Optional cache-control header.
 */
function toHttpStatus(value) {
    let status = Number(value);
    if (!Number.isInteger(status) || status < 100 || status > 599) {
        return 500;
    }
    return status;
}

module.exports = {

    /**
     * Initializes the file download response handler during service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the file download response handler after service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Sends a file download response.
     *
     * @param {Object} request Express request.
     * @param {Object} response Express response.
     * @param {Object} success Successful pipeline result containing file path.
     * @returns {void}
     * @sideEffects Writes a file download HTTP response.
     */
    handleSuccess: function (request, response, success) {
        if (!success || !success.filePath) {
            this.handleError(request, response, this.normalizeError({
                code: 'ERR_SYS_00000',
                responseCode: '500',
                message: 'File download response is missing filePath'
            }));
            return;
        }
        if (success.mimeType && response.type) {
            response.type(success.mimeType);
        }
        if (success.cacheControl && response.set) {
            response.set('Cache-Control', success.cacheControl);
        }
        let fileName = this.safeHeaderFileName(success.fileName || success.originalFileName || success.name);
        let transferCallback = this.handleTransferCallback(request, response);
        if (fileName) {
            response.download(success.filePath, fileName, transferCallback);
        } else {
            response.download(success.filePath, transferCallback);
        }
    },

    /**
     * Sends file download errors as JSON.
     *
     * @param {Object} request Express request.
     * @param {Object} response Express response.
     * @param {Object} error Error produced by pipeline execution.
     * @returns {void}
     */
    handleError: function (request, response, error) {
        error = this.normalizeError(error);
        if (this.LOG && this.LOG.error) {
            this.LOG.error(error);
        }
        if (response.headersSent) {
            return;
        }
        response.status(toHttpStatus(error.responseCode));
        response.json(this.publicError(error));
    },

    /**
     * Creates a transfer callback that converts stream/download failures to
     * normal bounded JSON errors when the response has not already started.
     *
     * @param {Object} request Express request.
     * @param {Object} response Express response.
     * @returns {Function} Express download callback.
     */
    handleTransferCallback: function (request, response) {
        return error => {
            if (error) {
                this.handleError(request, response, error);
            }
        };
    },

    /**
     * Returns a safe public error envelope without leaking circular objects,
     * raw request/response objects, or stack traces.
     *
     * @param {Error|Object} error Error produced by routing or transfer.
     * @returns {Object} Public error object.
     */
    publicError: function (error) {
        if (typeof SERVICE !== 'undefined' &&
            SERVICE &&
            SERVICE.DefaultJsonResponseHandlerService &&
            SERVICE.DefaultJsonResponseHandlerService.publicError) {
            return SERVICE.DefaultJsonResponseHandlerService.publicError(error);
        }
        return {
            responseCode: error.responseCode || '500',
            code: error.code || error.defaultCode || 'ERR_SYS_00000',
            name: error.name || 'Error',
            message: error.message || 'File download failed'
        };
    },

    /**
     * Converts unknown transfer failures into a Nodics-compatible error.
     *
     * @param {Error|Object} error Error produced by routing or transfer.
     * @returns {Error|Object} Normalized error.
     */
    normalizeError: function (error) {
        if (typeof CLASSES !== 'undefined' &&
            CLASSES &&
            CLASSES.NodicsError &&
            error instanceof CLASSES.NodicsError) {
            return error;
        }
        if (typeof CLASSES !== 'undefined' && CLASSES && CLASSES.NodicsError) {
            try {
                return new CLASSES.NodicsError(error);
            } catch (ignored) {
                return {
                    name: 'NodicsError',
                    code: error && error.code || error && error.defaultCode || 'ERR_SYS_00000',
                    responseCode: error && error.responseCode || '500',
                    message: error && error.message || 'File download failed'
                };
            }
        }
        return {
            name: error && error.name || 'Error',
            code: error && error.code || error && error.defaultCode || 'ERR_SYS_00000',
            responseCode: error && error.responseCode || '500',
            message: error && error.message || 'File download failed'
        };
    },

    /**
     * Removes CR/LF and path separators from public download filenames.
     *
     * @param {string} fileName Candidate filename.
     * @returns {string|undefined} Safe filename.
     */
    safeHeaderFileName: function (fileName) {
        if (!fileName || typeof fileName !== 'string') {
            return undefined;
        }
        return fileName.replace(/[\r\n\\/"]/g, '-').trim() || undefined;
    }
};
