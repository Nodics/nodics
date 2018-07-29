/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const conHandler = require('./bin/connectionHandler');

module.exports = {
    init: function () {

    },
    loadDatabase: function () {
        SYSTEM.LOG.info('Starting database configuration process');
        return new Promise((resolve, reject) => {
            conHandler.init().then(success => {
                SYSTEM.buildSchemas();
                SYSTEM.buildModelsForTenants().then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    loadOnlySchema: function () {
        SYSTEM.LOG.info('Starting database configuration process');
        return new Promise((resolve, reject) => {
            SYSTEM.buildSchemas();
            resolve(true);
        });
    },
};