/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const util = require('util');

/**
 * @module common/service/interceptor/DefaultInterceptorService
 * @description Loads, validates, merges, and executes Nodics interceptors. Interceptors
 * are dynamic extension points for model, schema, and process behavior and are executed
 * in configured trigger/index order.
 * @layer service
 * @owner nCommon
 * @override Project modules may contribute interceptor definitions or override this
 * service to customize dynamic behavior governance. Preserve error enrichment context.
 *
 * @property {Object} ENUMS.InterceptorType Interceptor type enum used for validation.
 * @property {Object} SERVICE.DefaultInterceptorConfigurationService Stores effective interceptor definitions.
 * @property {Object} SERVICE Dynamic service registry used to invoke interceptor handlers.
 */
module.exports = {

    /**
     * Validates raw interceptor definitions and merges them into the effective registry.
     *
     * @param {Object} rawInterceptors Raw interceptor definitions keyed by interceptor code/name.
     * @returns {void}
     * @throws NodicsError when interceptor type or trigger is invalid.
     */
    loadRawInterceptors: function (rawInterceptors) {
        let interceptors = {};
        Object.keys(rawInterceptors).forEach(interceptorName => {
            let interceptor = rawInterceptors[interceptorName];
            if (!interceptor.type || !ENUMS.InterceptorType.isDefined(interceptor.type)) {
                this.LOG.error('Type within interceptor definition is invalid for : ' + interceptorName);
                throw new CLASSES.NodicsError('ERR_SYS_00000', 'Type within interceptor definition is invalid for : ' + interceptorName);
            } else if (!interceptor.trigger) {
                this.LOG.error('trigger within interceptor definition can not be null or empty: ' + interceptorName);
                throw new CLASSES.NodicsError('ERR_SYS_00000', 'Trigger within interceptor definition can not be null or empty: ' + interceptorName);
            } else {
                if (!interceptor.item) {
                    interceptor.item = 'default';
                }
                if (!interceptors[interceptor.type]) {
                    interceptors[interceptor.type] = {};
                }
                if (!interceptors[interceptor.type][interceptor.item]) {
                    interceptors[interceptor.type][interceptor.item] = {};
                }
                if (!interceptors[interceptor.type][interceptor.item][interceptorName]) {
                    interceptors[interceptor.type][interceptor.item][interceptorName] = interceptor;
                } else {
                    _.merge(interceptors[interceptor.type][interceptor.item][interceptorName], interceptor);
                }
            }
        });
        SERVICE.DefaultInterceptorConfigurationService.setRawInterceptors(_.merge(
            SERVICE.DefaultInterceptorConfigurationService.getRawInterceptors(),
            interceptors
        ));
    },

    /**
     * Starts the interceptor update pipeline after a persisted interceptor change event.
     *
     * @param {Object} interceptor Updated interceptor payload.
     * @returns {Promise<string>} Resolves when interceptor update processing completes.
     * @throws Rejects when update pipeline fails.
     */
    handleInterceptorChangeEvent: function (interceptor) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('interceptorUpdatedPipeline', {
                authData: request.authData,
                tenant: request.tenant,
                moduleName: request.moduleName,
                event: request.event,
                data: request.event.data
            }, {}).then(success => {
                resolve('Interceptor updated successfully');
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Executes interceptor handlers sequentially.
     *
     * @param {Object[]} interceptorList Interceptors to execute in order.
     * @param {Object} request Nodics request context.
     * @param {Object} response Nodics response context.
     * @returns {Promise<boolean>} Resolves after all interceptors execute.
     * @throws Rejects with enriched NodicsError containing interceptor layer context.
     */
    executeInterceptors: function (interceptorList, request, response) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (interceptorList && interceptorList.length > 0) {
                    let interceptor = interceptorList.shift();
                    let serviceName = interceptor.handler.substring(0, interceptor.handler.indexOf('.'));
                    let functionName = interceptor.handler.substring(interceptor.handler.indexOf('.') + 1, interceptor.handler.length);
                    SERVICE[serviceName.toUpperCaseFirstChar()][functionName](request, response).then(success => {
                        _self.executeInterceptors(interceptorList, request, response).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => reject(CLASSES.NodicsError.enrich(error, {
                        layer: 'interceptor',
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
                    layer: 'interceptor',
                    tenant: request && request.tenant,
                    moduleName: request && request.moduleName,
                    schemaName: request && request.schemaModel && request.schemaModel.schemaName
                }));
            }
        });
    }
};
