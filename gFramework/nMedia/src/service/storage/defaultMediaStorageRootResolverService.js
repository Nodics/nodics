/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const path = require('path');

/**
 * @module gFramework/nMedia/src/service/storage/defaultMediaStorageRootResolverService
 * @description Resolves provider root paths without letting local runtime files
 * leak into the Nodics repository root.
 * @layer service
 * @owner nMedia
 * @override Later layers may override root resolution for project storage
 * policy, but must preserve backend authority and path traversal safety.
 */
module.exports = {

    /** Initializes the media storage root resolver service. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes the media storage root resolver service. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Resolves the configured or fallback local-provider root path.
     *
     * Absolute configured paths are used as deployment-owned paths. Relative
     * configured paths and empty fallback paths resolve under the active server
     * path because uploaded bytes are runtime state for the running server.
     *
     * @param {Object} request Root resolution request.
     * @param {Object} request.provider Provider configuration.
     * @param {string} [request.configuredPath] Optional explicit base path.
     * @returns {string} Absolute local storage root.
     */
    resolveLocalRoot: function (request) {
        request = request || {};
        let provider = request.provider || {};
        let configuredPath = request.configuredPath !== undefined ? request.configuredPath : provider.basePath;
        let fallback = provider.fallbackRelativeBasePath || 'temp/media';
        let rawPath = configuredPath || fallback;
        if (path.isAbsolute(rawPath)) {
            return path.resolve(rawPath);
        }
        return path.resolve(path.join(this.resolveServerRoot(), rawPath));
    },

    /**
     * Resolves the active server path with a safe local fallback for isolated tests.
     *
     * @returns {string} Active server path or current process directory.
     */
    resolveServerRoot: function () {
        if (typeof NODICS !== 'undefined' && NODICS.getServerPath) {
            return NODICS.getServerPath();
        }
        return process.cwd();
    }
};
