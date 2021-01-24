/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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

    schemaUpdateEventHandler: function (request) {
        return new Promise((resolve, reject) => {
            try {
                this.handleSchemaUpdate(request, request.event.data.models).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    handleSchemaUpdate: function (request, schemaList) {
        return new Promise((resolve, reject) => {
            if (schemaList && schemaList.length > 0) {
                let schemaCode = schemaList.shift();
                SERVICE.DefaultPipelineService.start('schemaUpdatedPipeline', {
                    tenant: request.tenant,
                    autData: request.autData,
                    event: request.event,
                    schemaCode: schemaCode
                }, {}).then(success => {
                    this.handleSchemaUpdate(request, schemaList).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve('Updated all schemas');
            }
        });
    },

    remove: function (request) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError('ERR_SYS_00002', 'This operation is not supported currently'));
        });
    },
    removeById: function (ids, tenant) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError('ERR_SYS_00002', 'This operation is not supported currently'));
        });
    },
    removeByCode: function (codes, tenant) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError('ERR_SYS_00002', 'This operation is not supported currently'));
        });
    },
    update: function (request) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError('ERR_SYS_00002', 'This operation is not supported currently'));
        });
    },
};