/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const Busboy = require('busboy');

/**
 * @module gFramework/nMedia/src/service/storage/DefaultMediaMultipartUploadBodyParserHandlerService
 * @description nMedia-owned multipart intake handler for governed media upload
 * routes. nRouter invokes this handler through the route's configured
 * `bodyParserHandler`, but nMedia owns the upload format, limits, validation
 * semantics, and file descriptor contract.
 * @layer service
 * @owner nMedia
 * @override Later modules may override this media parser to stream directly to
 * a storage provider or support additional media intake behavior while
 * preserving nMedia as the file/media lifecycle authority.
 */
module.exports = {

    /**
     * Initializes the media multipart upload body parser handler.
     *
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function () {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the media multipart upload body parser handler.
     *
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Returns Express middleware for nMedia upload requests.
     *
     * @param {Object} router Effective media upload router definition.
     * @returns {Array<Function>} Parser middleware chain.
     */
    getBodyParser: function (router) {
        return [this.parseMediaMultipartUpload.bind(this)];
    },

    /**
     * Parses a bounded media multipart upload request.
     *
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {Function} next Express continuation callback.
     * @returns {void}
     */
    parseMediaMultipartUpload: function (req, res, next) {
        let contentType = String(req.headers && req.headers['content-type'] || '');
        if (!contentType.toLowerCase().includes('multipart/form-data')) {
            next(new CLASSES.NodicsError('ERR_MED_00010', 'Media upload content type must be multipart/form-data'));
            return;
        }
        let limits = this.resolveUploadLimits();
        let fields = {};
        let files = [];
        let completed = false;
        let finishOnce = (error) => {
            if (completed) return;
            completed = true;
            next(error);
        };
        let parser;
        try {
            parser = Busboy({
                headers: req.headers,
                limits: {
                    fileSize: limits.maximumFileSizeBytes,
                    files: limits.maximumFiles,
                    fields: limits.maximumFields,
                    fieldSize: limits.maximumFieldSizeBytes
                }
            });
        } catch (error) {
            finishOnce(new CLASSES.NodicsError(error, null, 'ERR_MED_00010'));
            return;
        }
        parser.on('field', (fieldName, value) => {
            if (Object.prototype.hasOwnProperty.call(fields, fieldName)) {
                if (!Array.isArray(fields[fieldName])) fields[fieldName] = [fields[fieldName]];
                fields[fieldName].push(value);
            } else {
                fields[fieldName] = value;
            }
        });
        parser.on('file', (fieldName, fileStream, info) => {
            let originalFileName = info && info.filename || '';
            let chunks = [];
            let sizeBytes = 0;
            let limited = false;
            fileStream.on('data', chunk => {
                sizeBytes += chunk.length;
                chunks.push(chunk);
            });
            fileStream.on('limit', () => {
                limited = true;
            });
            fileStream.on('end', () => {
                if (limited) {
                    finishOnce(new CLASSES.NodicsError('ERR_MED_00010', 'Media upload file size exceeds configured limit'));
                    return;
                }
                files.push({
                    fieldName: fieldName,
                    originalFileName: originalFileName,
                    fileName: originalFileName,
                    mimeType: info && info.mimeType,
                    encoding: info && info.encoding,
                    buffer: Buffer.concat(chunks),
                    sizeBytes: sizeBytes
                });
            });
        });
        parser.on('filesLimit', () => finishOnce(new CLASSES.NodicsError('ERR_MED_00010', 'Media upload file count exceeds configured limit')));
        parser.on('fieldsLimit', () => finishOnce(new CLASSES.NodicsError('ERR_MED_00010', 'Media upload field count exceeds configured limit')));
        parser.on('error', error => finishOnce(new CLASSES.NodicsError(error, null, 'ERR_MED_00010')));
        parser.on('finish', () => {
            req.body = Object.assign({}, req.body || {}, fields);
            req.files = files;
            finishOnce();
        });
        req.pipe(parser);
    },

    /**
     * Resolves media upload parser limits from nMedia configuration.
     *
     * @returns {Object} Effective media upload parser limits.
     */
    resolveUploadLimits: function () {
        let media = CONFIG && typeof CONFIG.get === 'function' ? CONFIG.get('media') || {} : {};
        let upload = media.upload || {};
        return {
            maximumFileSizeBytes: Number(upload.maximumFileSizeBytes || 52428800),
            maximumFiles: Number(upload.maximumFiles || 1),
            maximumFields: Number(upload.maximumFields || 50),
            maximumFieldSizeBytes: Number(upload.maximumFieldSizeBytes || 1048576)
        };
    }
};
