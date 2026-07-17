/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module database/service/procs/query/DefaultModelQueryBuilderPipelineService
 * @description Pipeline step service that builds generated model lookup queries
 * from explicit query input, `_id`, primary keys, and model property placeholders.
 * It is used by schema-driven save/update/remove flows to resolve target models.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override query-building steps to support
 * project-specific natural keys or query conventions while preserving the
 * pipeline request/response/process contract.
 *
 * @property {Object} request.query Explicit query or query template.
 * @property {Object} request.model Model values used to resolve dynamic query placeholders.
 * @property {Object} request.schemaModel Generated schema model wrapper.
 */
module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Validates query-builder input.
     *
     * @param {Object} request Nodics query-builder request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating building query request');
        process.nextSuccess(request, response);
    },

    /**
     * Resolves an explicit query template against the current model.
     *
     * @param {Object} request Nodics query-builder request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     * @sideEffects Mutates `request.query` and may stop the pipeline.
     */
    buildFromOriginalQuery: function (request, response, process) {
        this.LOG.debug('Building query from original query');
        request.query = request.query || {};
        request.options = request.options || {};
        request.searchOptions = request.searchOptions || {};
        if (request.query && !UTILS.isBlank(request.query)) {
            request.query = this.resolveQuery(_.merge({}, request.query || {}), request.model);
            process.stop(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Stops query building when a custom query already exists.
     *
     * @param {Object} request Nodics query-builder request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    skipForCustomQuery: function (request, response, process) {
        this.LOG.debug('Skip build query if custom query available');
        if (request.query && !UTILS.isBlank(request.query)) {
            process.stop(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Builds an `_id` query from the model identifier.
     *
     * @param {Object} request Nodics query-builder request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     * @sideEffects Converts and writes `request.model._id` and `request.query`.
     */
    buildIdQuery: function (request, response, process) {
        this.LOG.debug('Building _Id query');
        if (request.model._id) {
            let objectId = SERVICE.DefaultDatabaseConfigurationService.toObjectId(request.schemaModel, request.model._id);
            request.query = {
                _id: objectId
            };
            request.model._id = objectId;
            process.stop(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Builds a query from schema primary key fields.
     *
     * @param {Object} request Nodics query-builder request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    buildPrimeryQuery: function (request, response, process) {
        this.LOG.debug('Building query from primery keys');
        let schemaOptions = request.schemaModel.rawSchema.schemaOptions[request.tenant];
        if (schemaOptions && schemaOptions.primaryKeys && schemaOptions.primaryKeys.length > 0) {
            if (!request.query) request.query = {};
            schemaOptions.primaryKeys.forEach(key => {
                if (request.model[key]) {
                    request.query[key] = request.model[key];
                }
            });
            process.stop(request, response);
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Resolves `$property` placeholders in a query template from a model.
     *
     * @param {Object} query Query template.
     * @param {Object} model Source model.
     * @returns {Object} Resolved query object.
     * @throws {Error} When a placeholder cannot be resolved from the model.
     */
    resolveQuery: function (query, model) {
        let queryStr = {};
        _.each(query, (propertyValue, propertyName) => {
            if (propertyName.indexOf(".") > 0 && propertyValue.startsWith('$')) {
                let properties = propertyName.split('.');
                let value = model;
                for (let element of properties) {
                    if (value[element]) {
                        value = value[element];
                    } else {
                        value = null;
                        break;
                    }
                }
                if (value) {
                    queryStr[propertyName] = value;
                }
            } else if (propertyValue.startsWith('$')) {
                propertyValue = propertyValue.substring(1, propertyValue.length);
                if (model[propertyValue]) {
                    queryStr[propertyName] = model[propertyValue];
                } else {
                    throw new Error('could not find a valid property ' + propertyName);
                }
            } else {
                queryStr[propertyName] = propertyValue;
            }
        });
        return queryStr;
    }
};
