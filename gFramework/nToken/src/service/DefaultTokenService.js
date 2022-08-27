/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information")
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics
*/

const _ = require('lodash');

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

    generateToken: function (request) {
        request.tokenService = this;
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('generateTokenPipeline', request, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, null, 'ERR_TKN_00000'));
            });
        });
    },

    validateToken: function (request) {
        request.tokenService = this;
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('validateTokenPipeline', request, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, null, 'ERR_TKN_00000'));
            });
        });
    },
};