/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    createDefaultDatabases: function () {
        const _self = this;
        if (!SYSTEM.validateDatabaseConfiguration()) {
            process.exit(CONFIG.get('errorExitCode'));
        }
        return new Promise((resolve, reject) => {
            SYSTEM.createTenantDatabase('default').then(success => {
                try {
                    if (NODICS.isModuleActive(CONFIG.get('profileModuleName'))) {
                        let db = NODICS.getDatabase(CONFIG.get('profileModuleName'), 'default');
                        if (db && db.master) {
                            SYSTEM.LOG.info('Checking if initialization required');
                            let profileDBClient = db.master.getConnection();
                            profileDBClient.db.collection('enterprisemodels', function (err, collection) {
                                collection.count({}, function (error, count) {
                                    if (count <= 0) {
                                        NODICS.setInitRequired(true);
                                    }
                                    resolve(true);
                                });
                            });
                        } else {
                            resolve(true);
                        }
                    } else {
                        resolve(true);
                    }
                } catch (error) {
                    //console.log(error);
                    reject(error);
                }

            }).catch(error => {
                reject('Something went wrong while creating database');
            });
        });
    },

    init: function () {
        SYSTEM.LOG.info("Starting Database creating process");
        return this.createDefaultDatabases();
    }
};