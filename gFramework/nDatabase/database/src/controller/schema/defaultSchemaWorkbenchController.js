/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/controller/schema/DefaultSchemaWorkbenchController
 * @description Maps secured Schema Workbench discovery requests to the owning
 * facade. This controller exposes metadata only; generated CRUD and domain
 * operations remain the sole mutation paths.
 * @layer controller
 * @owner nDatabase
 * @override Projects may replace this controller through normal layered
 * service registration while preserving secured metadata-only discovery.
 */
module.exports = {
    /**
     * Executes a Schema Workbench facade operation with optional callback support.
     * @param {string} operation Facade operation name.
     * @param {Object} request Nodics request.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise|undefined} Operation promise when no callback is supplied.
     */
    execute: function (operation, request, callback) {
        let promise = FACADE.DefaultSchemaWorkbenchFacade[operation](request);
        if (callback) {
            return promise.then(result => callback(null, result)).catch(callback);
        }
        return promise;
    },
    /**
     * Lists authorized schemas for the request module.
     * @param {Object} request Nodics request.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise|undefined} Discovery response.
     */
    list: function (request, callback) {
        return this.execute('list', request, callback);
    },
    /**
     * Returns one authorized schema descriptor.
     * @param {Object} request Nodics request containing the schema route parameter.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise|undefined} Discovery response.
     */
    get: function (request, callback) {
        return this.execute('get', request, callback);
    },
    /**
     * Searches one authorized schema through a bounded browser-safe contract.
     * @param {Object} request Nodics request containing schema and search input.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise|undefined} Paged record response.
     */
    search: function (request, callback) {
        return this.execute('search', request, callback);
    },
    /** Returns the authorized dependency impact before deleting records. */
    previewDeleteImpact: function (request, callback) {
        return this.execute('previewDeleteImpact', request, callback);
    },
    /** Deletes one authorized schema record through the generated owner service. */
    deleteRecord: function (request, callback) {
        return this.execute('deleteRecord', request, callback);
    },
    /** Executes one authorized bounded bulk schema operation. */
    bulk: function (request, callback) {
        return this.execute('bulk', request, callback);
    },
    /** Executes one authorized bounded schema aggregation. */
    aggregate: function (request, callback) {
        return this.execute('aggregate', request, callback);
    }
};
