/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    findByLoginId: function (request) {
        return new Promise((resolve, reject) => {
            this.get({
                tenant: request.tenant,
                options: {
                    recursive: true,
                },
                query: {
                    loginId: request.loginId
                }
            }).then(employees => {
                if (employees.result.length !== 1) {
                    reject(new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid login id: ' + request.loginId));
                } else {
                    resolve(employees.result[0]);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    findByAPIKey: function (request) {
        return new Promise((resolve, reject) => {
            this.get({
                tenant: request.tenant,
                query: {
                    apiKey: request.apiKey,
                }
            }).then(employees => {
                if (employees.result.length !== 1) {
                    reject(new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid apiKey'));
                } else {
                    resolve(employees.result[0]);
                }
            }).catch(error => {
                reject(error);
            });
        });
    }
};