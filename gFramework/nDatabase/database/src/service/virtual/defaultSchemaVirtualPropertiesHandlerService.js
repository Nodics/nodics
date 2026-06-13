/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module database/service/virtual/DefaultSchemaVirtualPropertiesHandlerService
 * @description Populates schema-defined virtual properties on database
 * documents by invoking configured service operations. This allows generated
 * models to expose computed values without hardcoding behavior into the base
 * persistence layer.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override virtual property population to support
 * async lookups, tenant-aware computation, or additional method formats while
 * preserving schema-defined virtual property contracts.
 *
 * @property {Object} SERVICE Dynamic service registry used to resolve virtual property methods.
 * @property {Object} virtualProperties Schema virtual property map.
 */
module.exports = {

    /**
     * Populates virtual properties for one document or an array of documents.
     *
     * @param {Object} virtualProperties Virtual property map from the schema.
     * @param {Object|Object[]} documents Database document or list of documents.
     * @returns {undefined}
     * @sideEffects Mutates document objects by assigning computed virtual properties.
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
     * Populates all configured virtual properties on a single document.
     *
     * @param {Object} virtualProperties Virtual property map from the schema.
     * @param {Object} document Database document.
     * @returns {undefined}
     * @sideEffects Mutates the document with computed values.
     */
    populateProperties: function (virtualProperties, document) {
        let _self = this;
        _.each(virtualProperties, (method, property) => {
            _self.populateProperty(property, method, document);
        });
    },

    /**
     * Populates one virtual property, recursively handling nested property maps.
     *
     * @param {string} property Property name to populate.
     * @param {Object|string} method Nested virtual property map or `Service.method` reference.
     * @param {Object} document Database document or nested document.
     * @returns {undefined}
     * @sideEffects Mutates the document with computed values.
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
     * Invokes the configured service method and assigns its result to the document.
     *
     * @param {string} property Property name to assign.
     * @param {string} method Service operation reference in `ServiceName.operationName` format.
     * @param {Object} document Database document.
     * @returns {undefined}
     * @sideEffects Calls the target service operation and writes `document[property]`.
     * @throws {TypeError} When the configured service or operation is unavailable.
     */
    populate: function (property, method, document) {
        let serviceName = method.substring(0, method.lastIndexOf('.'));
        let operation = method.substring(method.lastIndexOf('.') + 1, method.length);
        document[property] = SERVICE[serviceName][operation](document);
    }
};
