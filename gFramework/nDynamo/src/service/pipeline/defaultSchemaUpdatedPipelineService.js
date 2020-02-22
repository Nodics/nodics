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

    validateSchema: function (request, response, process) {
        this.LOG.debug('Validating schema update request');
        if (!request.schemaName) {
            process.error(request, response, new CLASSES.NodicsError('ERR_SYS_00000', 'Schema Name can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    retrieveSchema: function (request, response, process) {
        this.LOG.debug('Fatching updated schema object : ' + request.schemaName);
        SERVICE.DefaultSchemaConfigurationService.get({
            tenant: 'default',
            query: {
                code: request.schemaName
            }
        }).then(success => {
            if (success.result && success.result.length > 0) {
                request.runtimeSchema = success.result[0];
                process.nextSuccess(request, response);
            } else {
                _self.LOG.error('Could not found any data for schema name ' + request.schemaName);
                process.error(request, response, new CLASSES.NodicsError('ERR_SYS_00000', 'Could not found any data for schema name ' + request.schemaName));
            }
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    redirectRequest: function (request, response, process) {
        this.LOG.debug('Validating request for schema : ' + request.runtimeSchema.code);
        if (!request.runtimeSchema.active) {
            response.targetNode = 'schemaDeActivated';
        } else {
            response.targetNode = 'schemaActivated';
        }
        process.nextSuccess(request, response);
    }
};