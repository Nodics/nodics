/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const fs = require('fs');

/**
 * @module nRouter/utils/utils
 * @description Router utility helpers for route/model cache eligibility decisions.
 * @layer utils
 * @owner nRouter
 * @override Project modules may provide additional router utilities through later module layers; cache policy should remain configurable.
 */
module.exports = {

    /**
     * Determines whether an API route result is eligible for route-level caching.
     *
     * @param {Object|Array} result Controller or handler result.
     * @param {Object} router Effective router definition.
     * @param {Object} [router.cache] Route cache configuration.
     * @returns {boolean} True when the result is non-empty and route cache is enabled.
     */
    isApiCashable: function (result, router) {
        if (result &&
            result instanceof Array &&
            result.length > 0 &&
            router.cache &&
            router.cache.enabled) {
            return true;
        } else if (result &&
            result instanceof Object &&
            !UTILS.isBlank(result) &&
            router.cache &&
            router.cache.enabled) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * Determines whether a model result is eligible for schema/model-level caching.
     *
     * @param {Object|Array} result Model query result.
     * @param {Object} model Effective schema model metadata.
     * @param {Object} [model.cache] Model cache configuration.
     * @returns {boolean} True when the result is non-empty and model cache is enabled.
     */
    isItemCashable: function (result, model) {
        if (result &&
            result instanceof Array &&
            result.length > 0 &&
            model.cache &&
            model.cache.enabled) {
            return true;
        } else if (result &&
            result instanceof Object &&
            !UTILS.isBlank(result) &&
            model.cache &&
            model.cache.enabled) {
            return true;
        } else {
            return false;
        }
    }
};
