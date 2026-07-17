/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/service/interceptors/DefaultItemRendererInterceptorService
 * @description CMS post-load interceptor service that enriches pages and components with renderer names from type-code mappings.
 * @layer interceptor
 * @owner cms
 * @override Project modules may replace this interceptor to resolve renderers from a different mapping source or rendering policy.
 * @property {Object} SERVICE.DefaultCmsTypeCode2RendererService Loads renderer mappings for CMS type codes.
 */
module.exports = {
    /**
     * Initializes CMS renderer enrichment handlers during service registration.
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
     * Finalizes CMS renderer enrichment startup after module artifacts are registered.
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
     * Enriches loaded CMS models with renderer information.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} response Schema post-get response containing result models.
     * @returns {Promise<boolean>} Resolves after all models have renderer values where mappings exist.
     * @throws Wraps renderer lookup errors in a Nodics error.
     */
    loadItemRenderer: function (request, response) {
        return new Promise((resolve, reject) => {
            this.fatchItemRenderer(request, response.success.result).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, 'while loading component renderer'));
            });
        });
    },

    /**
     * Recursively resolves renderer values for CMS models that do not already carry one.
     *
     * @param {Object} request Nodics request context.
     * @param {Array<Object>} models CMS page or component models to enrich.
     * @param {number} [counter=0] Current recursive index.
     * @returns {Promise<boolean>} Resolves after renderer lookup completes for all models.
     * @sideEffects Mutates `model.renderer` when a type-code mapping is found.
     */
    fatchItemRenderer: function (request, models, counter = 0) {
        return new Promise((resolve, reject) => {
            if (models && counter < models.length) {
                let model = models[counter];
                if (!model.renderer) {
                    let typeCode = model.typeCode;
                    if (UTILS.isObject(typeCode)) {
                        typeCode = typeCode.code;
                    }
                    SERVICE.DefaultCmsTypeCode2RendererService.get({
                        tenant: request.tenant,
                        authData: request.authData,
                        options: request.options,
                        query: {
                            code: typeCode
                        }
                    }).then(success => {
                        if (success.result && success.result.length > 0) {
                            model.renderer = success.result[0].renderer;
                        }
                        this.fatchItemRenderer(request, models, ++counter).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    this.fatchItemRenderer(request, models, ++counter).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    }
};
