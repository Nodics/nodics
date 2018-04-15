/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const conHandler = require('./bin/connectionHandler');

module.exports = {
    init: function() {

    },
    loadDatabase: function() {
        SYSTEM.LOG.info('Starting database configuration process');
        return new Promise((resolve, reject) => {
            conHandler.init().then(success => {
                SYSTEM.deployValidators();
                SYSTEM.deploySchemas();
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    loadTenantDatabase: function() {
        return new Promise((resolve, reject) => {
            SYSTEM.createModuleDatabaseConnection().then(success => {
                let tenants = NODICS.getTenants().slice(0);
                var index = tenants.indexOf('default');
                if (index > -1) {
                    tenants.splice(index, 1);
                }
                let options = {
                    tenants: tenants,
                    interceptors: SYSTEM.loadFiles('/src/schemas/interceptors.js'),
                    daos: SYSTEM.loadFiles('/src/schemas/model.js'),
                };
                SYSTEM.createSchemas(options);
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    }
};