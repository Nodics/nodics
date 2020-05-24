/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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

    buildCarrier: function (schemaDef, model, workflow) {
        let sourceBuilder = workflow.sourceBuilder;
        let codeGeneratorKey = (sourceBuilder.codeStrategy) ? sourceBuilder.codeStrategy.name || 'DEFAULT' : 'DEFAULT'; // CONFIG.get('workflow').carrierCodeStrategy2Hnadler.DEFAULT;
        let codeGeneratorService = CONFIG.get('workflow').carrierCodeStrategy2Hnadler[codeGeneratorKey];
        if (!codeGeneratorService) {
            throw new Error('Invalid source builder configuration, check code strategy value');
        } else {
            return {
                code: SERVICE[CONFIG.get('workflow').carrierCodeStrategy2Hnadler[codeGeneratorKey]].generateCarrierCode({
                    schemaDef: schemaDef,
                    model: model,
                    workflow: workflow,
                    params: sourceBuilder.codeStrategy.params
                }),
                sourceDetail: {
                    schemaName: schemaDef.schemaName,
                    moduleName: schemaDef.moduleName,
                },
                type: workflow.carrierType || CONFIG.get('workflow').defaultCarrierType,
                event: {
                    enabled: true,
                    isInternal: true
                }
            };
        }
    }
};