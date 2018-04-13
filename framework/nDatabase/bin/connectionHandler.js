/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    createDefaultDatabases: function() {
        const _self = this;
        return new Promise((resolve, reject) => {
            if (!SYSTEM.validateDatabaseConfiguration()) {
                process.exit(CONFIG.get('errorExitCode'));
            }
            SYSTEM.createDatabase('default', 'default').then(success => {
                let modules = NODICS.getModules();
                let allModules = [];
                _.each(modules, (value, moduleName) => {
                    if (CONFIG.get('database')[moduleName]) {
                        allModules.push(SYSTEM.createDatabase(moduleName, 'default'));
                    }
                });
                if (allModules.length > 0) {
                    Promise.all(allModules).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    init: function() {
        SYSTEM.LOG.info("Starting Database creating process");
        return this.createDefaultDatabases();
    }
};