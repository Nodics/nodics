/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/service/interceptors/DefaultCmsComponentDetailInterceptorService
 * @description CMS interceptor service that generates component-detail codes and normalizes page/component relationship sources before save.
 * @layer interceptor
 * @owner cms
 * @override Project modules may replace this interceptor to customize component-detail identity or source assignment rules.
 */
module.exports = {
    /**
     * Initializes CMS component-detail interceptor handlers during service registration.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when handler initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes CMS component-detail interceptor startup after module artifacts are registered.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Generates a component-detail code from source and target when no code is supplied.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.model CMS component-detail model being saved.
     * @param {Object} response Interceptor response context.
     * @returns {Promise<boolean>} Resolves after detail code normalization.
     * @sideEffects Mutates `request.model.code`.
     */
    generateCmsComponentDetailCode: function (request, response) {
        return new Promise((resolve, reject) => {
            if (!request.model.code) request.model.code = request.model.source + '2' + request.model.target.toUpperCaseFirstChar();
            resolve(true);
        });
    },

    /**
     * Sets missing component-detail source values from the parent CMS page code.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.model CMS page model being saved.
     * @param {Object} response Interceptor response context.
     * @returns {Promise<boolean>} Resolves after page component details are normalized.
     * @sideEffects Mutates entries in `request.model.cmsComponents`.
     */
    setCompDetailSourceForPage: function (request, response) {
        return new Promise((resolve, reject) => {
            let model = request.model;
            if (model.cmsComponents && model.cmsComponents.length > 0) {
                model.cmsComponents.forEach(detail => {
                    if (!detail.source) detail.source = model.code;
                });
            }
            resolve(true);
        });
    },

    /**
     * Sets missing component-detail source values from the parent CMS component code.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.model CMS component model being saved.
     * @param {Object} response Interceptor response context.
     * @returns {Promise<boolean>} Resolves after sub-component details are normalized.
     * @sideEffects Mutates entries in `request.model.subComponents`.
     */
    setCompDetailSourceForComp: function (request, response) {
        return new Promise((resolve, reject) => {
            let model = request.model;
            if (model.subComponents && model.subComponents.length > 0) {
                model.subComponents.forEach(detail => {
                    if (!detail.source) detail.source = model.code;
                });
            }
            resolve(true);
        });
    }
};
