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

    loadSubComponents: function (request, response) {
        return new Promise((resolve, reject) => {
            this.fatchSubComponent(request, response.success.result).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, 'while loading sub components'));
            });
        });
    },

    fatchSubComponent: function (request, models, counter = 0) {
        return new Promise((resolve, reject) => {
            if (models && counter < models.length) {
                let model = models[counter];
                let options = _.merge({}, request.options);
                options.recursive = false;
                SERVICE.DefaultCmsComponentService.get({
                    tenant: request.tenant,
                    authData: request.authData,
                    options: options,
                    query: {
                        superCatalog: model.code,
                        active: true
                    }
                }).then(success => {
                    if (success.result && success.result.length > 0) {
                        model.subComponents = success.result;
                    }
                    this.fatchSubComponent(request, models, ++counter).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }
        });
    }
};