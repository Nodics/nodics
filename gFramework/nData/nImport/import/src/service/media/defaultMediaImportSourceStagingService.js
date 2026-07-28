/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

/**
 * @module gFramework/nData/nImport/import/src/service/media/defaultMediaImportSourceStagingService
 * @description Stages nMedia-owned import files into nImport-owned run workspaces.
 * @layer service
 * @owner import
 * @override Later import definition services may call this staging primitive while preserving nMedia storage authority and nImport execution authority.
 */
module.exports = {

    /** Initializes media import staging. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes media import staging. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Stages a media source into an import-run-owned local import structure.
     *
     * @param {Object} request Import request carrying source.type MEDIA.
     * @returns {Promise<Object>} Staged input path and safe media source summary.
     */
    stage: async function (request) {
        request = request || {};
        let mediaCode = this.resolveMediaCode(request);
        let mediaSource = await SERVICE.DefaultMediaImportSourceResolverService.resolve({
            tenant: request.tenant,
            authData: request.authData,
            mediaCode: mediaCode
        });
        this.validateReadableSource(mediaSource);
        let rootPath = this.resolveRootPath(request);
        let dataPath = path.join(rootPath, 'data');
        let successPath = path.join(rootPath, 'success');
        let errorPath = path.join(rootPath, 'error');
        let targetFileName = this.resolveTargetFileName(mediaSource, request);
        let targetPath = path.join(dataPath, targetFileName);
        await fse.ensureDir(dataPath);
        await fse.ensureDir(successPath);
        await fse.ensureDir(errorPath);
        await fse.copy(mediaSource.source.absolutePath, targetPath, { overwrite: true, errorOnExist: false });
        this.verifyChecksum(targetPath, mediaSource);
        return {
            inputPath: {
                rootPath: rootPath,
                dataPath: dataPath,
                successPath: successPath,
                errorPath: errorPath,
                importType: 'media',
                dataType: 'media',
                postFix: 'data'
            },
            mediaSource: this.projectMediaSource(mediaSource, targetFileName),
            stagedFile: {
                fileName: targetFileName,
                path: targetPath
            }
        };
    },

    /** Resolves media code from supported request shapes. */
    resolveMediaCode: function (request) {
        let source = request.source || request.mediaSource || {};
        let mediaCode = request.mediaCode || source.mediaCode || source.code;
        if (!mediaCode || source.type && String(source.type).toUpperCase() !== 'MEDIA') {
            throw new CLASSES.DataImportError('ERR_IMP_00008', 'Invalid media import source request');
        }
        return mediaCode;
    },

    /** Resolves import-run-owned staging root path. */
    resolveRootPath: function (request) {
        if (request.outputPath && request.outputPath.rootPath) {
            return path.resolve(request.outputPath.rootPath);
        }
        let runId = request.importRun && request.importRun.runId || request.runId || this.uuid();
        let basePath = NODICS.getServerPath() + '/' + (CONFIG.get('data').dataDirName || 'temp') + '/import/media';
        return path.resolve(basePath, runId);
    },

    /** Returns a safe target file name for the staged data file. */
    resolveTargetFileName: function (mediaSource, request) {
        let requestedPrefix = request && request.dataFilePrefix;
        let fileName = path.basename(mediaSource.fileName || mediaSource.mediaCode || 'media-import-source');
        let extension = path.extname(fileName) || (mediaSource.extension ? '.' + mediaSource.extension : '');
        if (requestedPrefix) {
            fileName = String(requestedPrefix) + extension;
        } else if (!path.extname(fileName) && mediaSource.extension) {
            fileName += extension;
        }
        return fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
    },

    /** Validates backend-only readable source descriptor. */
    validateReadableSource: function (mediaSource) {
        if (!mediaSource || !mediaSource.source || !mediaSource.source.absolutePath) {
            throw new CLASSES.DataImportError('ERR_IMP_00008', 'Media import source is not readable');
        }
        if (!fs.existsSync(mediaSource.source.absolutePath)) {
            throw new CLASSES.DataImportError('ERR_IMP_00008', 'Media import source file does not exist');
        }
        if (!mediaSource.folderCode) {
            throw new CLASSES.DataImportError('ERR_IMP_00008', 'Media import source folder is unavailable');
        }
        return true;
    },

    /** Verifies checksum when the media record provides one. */
    verifyChecksum: function (targetPath, mediaSource) {
        if (!mediaSource.checksum) return true;
        let algorithm = mediaSource.checksumAlgorithm || 'sha256';
        let hash = crypto.createHash(algorithm).update(fs.readFileSync(targetPath)).digest('hex');
        if (hash !== mediaSource.checksum) {
            throw new CLASSES.DataImportError('ERR_IMP_00008', 'Media import source checksum validation failed');
        }
        return true;
    },

    /** Returns a safe diagnostic projection. */
    projectMediaSource: function (mediaSource, targetFileName) {
        return {
            mediaCode: mediaSource.mediaCode,
            folderCode: mediaSource.folderCode,
            formatCode: mediaSource.formatCode,
            providerCode: mediaSource.providerCode,
            fileName: targetFileName,
            mimeType: mediaSource.mimeType,
            extension: mediaSource.extension,
            sizeBytes: mediaSource.sizeBytes,
            checksum: mediaSource.checksum,
            checksumAlgorithm: mediaSource.checksumAlgorithm
        };
    },

    /** Generates a fallback run id. */
    uuid: function () {
        return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
    }
};
