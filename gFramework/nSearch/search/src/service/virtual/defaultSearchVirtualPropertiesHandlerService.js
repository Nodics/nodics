/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nSearch/search/src/service/virtual/defaultSearchVirtualPropertiesHandlerService
 * @description Implements nSearch default search virtual properties handler service business behavior and extension logic.
 * @layer service
 * @owner nSearch
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Executes populate virtual properties behavior.

     *

     * @param {*} virtualProperties Method input.

     * @param {*} documents Method input.

     * @returns {*} Method result.

     */

    populateVirtualProperties: function (virtualProperties, documents) {
        if (documents instanceof Array) {
            documents.forEach(document => {
                this.populateProperties(virtualProperties, document);
            });
        } else {
            this.populateProperties(virtualProperties, documents);
        }
    },
    /**
     * Executes populate properties behavior.
     *
     * @param {*} virtualProperties Method input.
     * @param {*} document Method input.
     * @returns {*} Method result.
     */
    populateProperties: function (virtualProperties, document) {
        let _self = this;
        _.each(virtualProperties, (method, property) => {
            _self.populateProperty(property, method, document);
        });
    },

    /**

     * Executes populate property behavior.

     *

     * @param {*} property Method input.

     * @param {*} method Method input.

     * @param {*} document Method input.

     * @returns {*} Method result.

     */

    populateProperty: function (property, method, document) {
        let _self = this;
        if (method instanceof Object) {
            let doc = document[property];
            if (!UTILS.isBlank(doc)) {
                _.each(method, (value, prop) => {
                    _self.populateProperty(prop, value, doc);
                });
            }
        } else {
            this.populate(property, method, document);
        }
    },

    /**

     * Executes populate behavior.

     *

     * @param {*} property Method input.

     * @param {*} method Method input.

     * @param {*} document Method input.

     * @returns {*} Method result.

     */

    populate: function (property, method, document) {
        let serviceName = method.substring(0, method.lastIndexOf('.'));
        let operation = method.substring(method.lastIndexOf('.') + 1, method.length);
        document[property] = SERVICE[serviceName][operation](document);
    }
};