/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module common/service/processor/DefaultProcessorHandlerService
 * @description Executes configured processor handlers sequentially for model and search
 * processing flows. Processor failures are enriched with layer, handler, tenant, module,
 * schema, or index context before being propagated.
 * @layer service
 * @owner nCommon
 * @override Project modules may add processor handlers through configuration or override
 * this service to change processor sequencing while preserving error context enrichment.
 *
 * @property {Object} SERVICE Dynamic service registry used to invoke processor handlers.
 * @property {Object} CLASSES.NodicsError Standard error enrichment contract.
 */
module.exports = {

    /**
     * Executes search processor handlers sequentially.
     *
     * @param {string[]} interceptorList Processor handler names in `Service.method` format.
     * @param {Object} request Search request context.
     * @param {Object} response Search response context.
     * @returns {Promise<boolean>} Resolves after all processors execute.
     * @throws Rejects with enriched NodicsError containing search processor context.
     */
    executeSearchProcessors: function (interceptorList, request, response) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (interceptorList && interceptorList.length > 0) {
                    let interceptor = interceptorList.shift();
                    let serviceName = interceptor.substring(0, interceptor.indexOf('.'));
                    let functionName = interceptor.substring(interceptor.indexOf('.') + 1, interceptor.length);
                    SERVICE[serviceName][functionName](request, response).then(success => {
                        _self.executeSearchProcessors(interceptorList, request, response).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => reject(CLASSES.NodicsError.enrich(error, {
                        layer: 'processor',
                        processorType: 'search',
                        handler: interceptor,
                        serviceName: serviceName,
                        operation: functionName,
                        tenant: request && request.tenant,
                        moduleName: request && request.moduleName,
                        indexName: request && request.indexName
                    })));
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(CLASSES.NodicsError.enrich(error, {
                    layer: 'processor',
                    processorType: 'search',
                    tenant: request && request.tenant,
                    moduleName: request && request.moduleName,
                    indexName: request && request.indexName
                }));
            }
        });
    },

    /**
     * Executes model processor handlers sequentially.
     *
     * @param {Object[]} interceptorList Processor definitions containing `handler`.
     * @param {Object} request Model request context.
     * @param {Object} response Model response context.
     * @returns {Promise<boolean>} Resolves after all processors execute.
     * @throws Rejects with enriched NodicsError containing model processor context.
     */
    executeProcessors: function (interceptorList, request, response) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (interceptorList && interceptorList.length > 0) {
                    let interceptor = interceptorList.shift();
                    let serviceName = interceptor.handler.substring(0, interceptor.handler.indexOf('.'));
                    let functionName = interceptor.handler.substring(interceptor.handler.indexOf('.') + 1, interceptor.handler.length);
                    SERVICE[serviceName][functionName](request, response).then(success => {
                        _self.executeProcessors(interceptorList, request, response).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => reject(CLASSES.NodicsError.enrich(error, {
                        layer: 'processor',
                        processorType: 'model',
                        handler: interceptor.handler,
                        serviceName: serviceName,
                        operation: functionName,
                        tenant: request && request.tenant,
                        moduleName: request && request.moduleName,
                        schemaName: request && request.schemaModel && request.schemaModel.schemaName
                    })));
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(CLASSES.NodicsError.enrich(error, {
                    layer: 'processor',
                    processorType: 'model',
                    tenant: request && request.tenant,
                    moduleName: request && request.moduleName,
                    schemaName: request && request.schemaModel && request.schemaModel.schemaName
                }));
            }
        });
    },
};
