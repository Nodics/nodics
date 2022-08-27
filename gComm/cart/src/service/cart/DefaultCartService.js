/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information")
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics
*/

module.exports = {
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    createCart: function (request) {
        request.schemaModel = NODICS.getModels('cart', request.tenant).OrderModel;
        request.moduleName = request.moduleName || request.schemaModel.moduleName;
        request.cartService = this;
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('createCartPipeline', request, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, null, 'ERR_ORD_00000'));
            });
        });
    },

    loadCart: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.get(request).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, null, 'ERR_ORD_00000'));
            });
        });
    }
};