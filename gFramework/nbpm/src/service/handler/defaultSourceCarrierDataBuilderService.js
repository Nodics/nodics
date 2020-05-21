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
        let codeGenerator = sourceBuilder.codeStrategy || CONFIG.get('workflow').carrierCodeStrategy2Hnadler.DEFAULT;
        return {
            code: SERVICE[codeGenerator].generateCarrierCode({
                schemaDef: schemaDef,
                model: model,
                workflow: workflow,
                params: sourceBuilder.codeStrategy.params
            }),
            sourceDetail: {
                schemaName: schemaDef.schemaName,
                moduleName: schemaDef.moduleName,
            },
            event: {
                enabled: true
            }
        };
    }
};