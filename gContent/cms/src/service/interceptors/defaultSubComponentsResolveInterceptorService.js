/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/service/interceptors/DefaultSubComponentsResolveInterceptorService
 * @description CMS post-load interceptor service that resolves active child components for loaded CMS component models.
 * @layer interceptor
 * @owner cms
 * @override Project modules may replace this interceptor to customize recursive content expansion or component filtering.
 * @property {Object} SERVICE.DefaultCmsComponentService Loads CMS child components by parent component code.
 */
module.exports = {
    /**
     * Initializes CMS sub-component resolver handlers during service registration.
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
     * Finalizes CMS sub-component resolver startup after module artifacts are registered.
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
     * Resolves child components for every loaded CMS component in a post-get response.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} response Schema post-get response containing result models.
     * @returns {Promise<boolean>} Resolves after child components are loaded.
     * @throws Wraps resolver errors in a Nodics error.
     */
    loadSubComponents: function (request, response) {
        return new Promise((resolve, reject) => {
            this.fatchSubComponent(request, response.success.result).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, 'while loading sub components'));
            });
        });
    },

    /**
     * Recursively loads active child components for each supplied CMS component model.
     *
     * @param {Object} request Nodics request context.
     * @param {Array<Object>} models CMS component models to enrich.
     * @param {number} [counter=0] Current recursive index.
     * @returns {Promise<boolean>} Resolves after all component lookups complete.
     * @sideEffects Mutates `model.subComponents` when active child components are found.
     */
    fatchSubComponent: function (request, models, counter = 0) {
        return new Promise((resolve, reject) => {
            if (models && counter < models.length) {
                let model = models[counter];
                let options = _.merge({}, request.options);
                options.recursive = false;
                SERVICE.DefaultCmsComponentService.get({
                    tenant: request.tenant,
                    authData: request.authData,
                    options: options,
                    query: {
                        superCatalog: model.code,
                        active: true
                    }
                }).then(success => {
                    if (success.result && success.result.length > 0) {
                        model.subComponents = success.result;
                    }
                    this.fatchSubComponent(request, models, ++counter).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }
        });
    }
};
