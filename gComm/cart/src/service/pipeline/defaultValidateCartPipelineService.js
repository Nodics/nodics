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

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating create order request');
        process.nextSuccess(request, response);
    },
    prepareToken: function (request, response, process) {
        this.LOG.debug('Generating token for cart');
        let cartModel = request.model;
        if (UTILS.isBlank(cartModel.token)) {
            SERVICE.DefaultTokenService.get(_.merge(_.merge({}, request), {
                query: {
                    key: cartModel.refCode,
                    ops: 'createCart',
                    active: true,
                },
                searchOptions: {
                    pageSize: 1,
                    sort: {
                        expireAt: -1
                    }
                }
            })).then(result => {
                if (result.result && result.result.length == 1) {
                    cartModel.token = result.result[0].value;
                    process.nextSuccess(request, response);
                } else {
                    SERVICE.DefaultTokenService.save({
                        tenant: request.tenant,
                        model: {
                            key: cartModel.refCode,
                            ops: 'createCart',
                            type: 'ORDER',
                            active: true
                        }
                    }).then(result => {
                        cartModel.token = result.result.value;
                        process.nextSuccess(request, response);
                    }).catch(error => {
                        process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_TKN_00000'));
                    });
                }
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_TKN_00000'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    validateMandateValues: function (request, response, process) {
        this.LOG.debug('Validating create order mandate values');
        process.nextSuccess(request, response);
    },

    validateItems: function (request, response, process) {
        this.LOG.debug('Validating associated items');
        process.nextSuccess(request, response);
    },

    validateConsignments: function (request, response, process) {
        this.LOG.debug('Validating associated consignments');
        process.nextSuccess(request, response);
    },

    validatePayments: function (request, response, process) {
        this.LOG.debug('Validating associated payments');
        process.nextSuccess(request, response);
    },

    validateCart: function (request, response, process) {
        this.LOG.debug('Validating associated order');
        process.nextSuccess(request, response);
    }
};