/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const MongoClient = require('mongodb').MongoClient;

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

    createConnection: function (config) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Creating MongoDB database connection for URI: ' + config.URI + '/' + config.databaseName);
            let mongoClient = new MongoClient(config.URI, config.options || {});
            mongoClient.connect().then(client => {
                _self.LOG.debug('  connected to: ' + config.URI + '/' + config.databaseName);
                let db = client.db(config.databaseName);
                db.listCollections({}, {
                    nameOnly: true
                }).toArray((error, collections) => {
                    if (error) {
                        // _self.LOG.error('While fetching list of collections: ', error);
                        // reject('While fetching list of collections: ' + error);
                        reject(new CLASSES.NodicsError(error, 'While fetching list of collections', 'ERR_DBS_00000'));
                    } else {
                        resolve({
                            client: mongoClient,
                            connection: db,
                            collections: collections
                        });
                    }
                });
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, 'MongoDB default connection error', 'ERR_DBS_00000'));
            });
        });
    },

    isInitRequired: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let db = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(CONFIG.get('profileModuleName'), 'default');
                if (db && db.master) {
                    if (!db.master.getCollectionList() || db.master.getCollectionList().length <= 0) {
                        _self.LOG.info('System requires initial data to be imported');
                        resolve(true);
                    } else {
                        db.master.getConnection().collection('EnterpriseModel').findOne({}, function (err, result) {
                            if (err) {
                                _self.LOG.error('Not able to fetch if initial data required or not');
                                _self.LOG.error(err);
                                resolve(false);
                            } else if (!result) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        });
                    }
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'MongoDB default connection error', 'ERR_DBS_00000'));
            }
        });
    },

    getRuntimeSchema: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let db = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase('default', 'default');
                if (db && db.master) {
                    db.master.getConnection().collection('SchemaConfigurationModel').find({}, {}).toArray((err, result) => {
                        if (err) {
                            _self.LOG.error('Not able to fetch runtime schema update data');
                            reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Not able to fetch runtime schema update data'));
                        } else {
                            resolve(result);
                        }
                    });
                } else {
                    reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Invalid database connection'));
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'MongoDB default connection error', 'ERR_DBS_00000'));
            }
        });
    },

    closeConnection: function (connection) {
        connection.getClient().close();
    }
};