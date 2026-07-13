/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module database/service/interceptors/DefaultSampleInterceptorService
 * @description Sample no-op schema interceptor implementation for generated
 * CRUD lifecycle hooks. It documents the interceptor contract and provides a
 * safe extension template for project modules.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override these hook methods to implement
 * schema-specific behavior without changing generated CRUD services.
 *
 * @property {Object} request Nodics model request flowing through the CRUD pipeline.
 * @property {Object} response Current pipeline response.
 */
module.exports = {
    /**
     * Initializes the sample interceptor service.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the sample interceptor service.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Handles the pre-get interceptor hook.
     *
     * @param {Object} request Nodics model request.
     * @param {Object} response Current pipeline response.
     * @returns {Promise<boolean>} Resolves without mutation by default.
     */
    handlePreGet: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    /**
     * Handles the post-get interceptor hook.
     *
     * @param {Object} request Nodics model request.
     * @param {Object} response Current pipeline response.
     * @returns {Promise<boolean>} Resolves without mutation by default.
     */
    handlePostGet: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Handles the post-save interceptor hook.
     *
     * @param {Object} request Nodics model request.
     * @param {Object} response Current pipeline response.
     * @returns {Promise<boolean>} Resolves without mutation by default.
     */
    handlePostSave: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Handles the pre-remove interceptor hook.
     *
     * @param {Object} request Nodics model request.
     * @param {Object} response Current pipeline response.
     * @returns {Promise<boolean>} Resolves without mutation by default.
     */
    handlePreRemove: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    /**
     * Handles the post-remove interceptor hook.
     *
     * @param {Object} request Nodics model request.
     * @param {Object} response Current pipeline response.
     * @returns {Promise<boolean>} Resolves without mutation by default.
     */
    handlePostRemove: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Handles the post-update interceptor hook.
     *
     * @param {Object} request Nodics model request.
     * @param {Object} response Current pipeline response.
     * @returns {Promise<boolean>} Resolves without mutation by default.
     */
    handlePostUpdate: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

};
