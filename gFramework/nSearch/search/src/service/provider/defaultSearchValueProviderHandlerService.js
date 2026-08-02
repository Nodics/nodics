/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nSearch/search/src/service/provider/defaultSearchValueProviderHandlerService
 * @description Implements nSearch default search value provider handler service business behavior and extension logic.
 * @layer service
 * @owner nSearch
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Processes value providers behavior.

     *

     * @param {*} valueProviders Method input.

     * @param {*} model Method input.

     * @returns {*} Method result.

     */

    handleValueProviders: function (valueProviders, model) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.handleValueProvider(Object.keys(valueProviders), valueProviders, model).then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },
    /**
     * Processes value provider behavior.
     *
     * @param {*} properties Method input.
     * @param {*} valueProviders Method input.
     * @param {*} model Method input.
     * @returns {*} Method result.
     */
    handleValueProvider: function (properties, valueProviders, model) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (properties && properties.length > 0) {
                    let property = properties.shift();
                    let valueProvider = valueProviders[property];
                    let serviceName = valueProvider.substring(0, valueProvider.lastIndexOf('.'));
                    let operation = valueProvider.substring(valueProvider.lastIndexOf('.') + 1, valueProvider.length);
                    SERVICE[serviceName][operation](model).then(success => {
                        model[property] = success;
                        _self.handleValueProvider(properties, valueProviders, model).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(new CLASSES.SearchError(error));
            }
        });
    }
};