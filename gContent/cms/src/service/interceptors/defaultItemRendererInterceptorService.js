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

    loadItemRenderer: function (request, response) {
        return new Promise((resolve, reject) => {
            this.fatchItemRenderer(request, response.success.result).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, 'while loading component renderer'));
            });
        });
    },

    fatchItemRenderer: function (request, models, counter = 0) {
        return new Promise((resolve, reject) => {
            if (models && counter < models.length) {
                let model = models[counter];
                if (!model.renderer) {
                    let typeCode = model.typeCode;
                    if (UTILS.isObject(typeCode)) {
                        typeCode = typeCode.code;
                    }
                    SERVICE.DefaultCmsTypeCode2RendererService.get({
                        tenant: request.tenant,
                        authData: request.authData,
                        options: request.options,
                        query: {
                            code: typeCode
                        }
                    }).then(success => {
                        if (success.result && success.result.length > 0) {
                            model.renderer = success.result[0].renderer;
                        }
                        this.fatchItemRenderer(request, models, ++counter).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    this.fatchItemRenderer(request, models, ++counter).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    }
};