/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const MongoClient = require('mongodb').MongoClient;

/**
 * @module mongodb/service/connection/DefaultMongodbDatabaseConnectionHandlerService
 * @description MongoDB implementation of the Nodics database connection handler
 * contract. It creates Mongo clients, discovers collections, detects initial
 * data requirements, reads runtime schema configuration, and closes clients.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override this adapter to customize MongoDB
 * connection options, readiness checks, runtime schema storage, or client
 * lifecycle while preserving the generic database connection handler contract.
 *
 * @property {Object} config.URI MongoDB server URI.
 * @property {string} config.databaseName MongoDB database name.
 * @property {Object} config.options MongoClient options.
 */
module.exports = {
    /**
     * Initializes the MongoDB connection handler.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the MongoDB connection handler.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Creates a MongoDB client/database connection and lists existing collections.
     *
     * @param {Object} config MongoDB connection configuration.
     * @param {string} config.URI MongoDB server URI.
     * @param {string} config.databaseName Database name.
     * @param {Object} [config.options] MongoClient options.
     * @returns {Promise<Object>} Connection response containing client, db connection, and collection list.
     * @throws {CLASSES.NodicsError} When MongoDB connection or collection discovery fails.
     */
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

    /**
     * Checks whether initial data import is required for the profile database.
     *
     * @returns {Promise<boolean>} Resolves true when the profile database appears uninitialized.
     * @throws {CLASSES.NodicsError} When the readiness check fails unexpectedly.
     */
    isInitRequired: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let defaultTenant = CONFIG.get('defaultTenant') || 'default';
                let db = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(CONFIG.get('profileModuleName'), defaultTenant);
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

    /**
     * Reads runtime schema configuration from MongoDB.
     *
     * @returns {Promise<Object[]>} Runtime schema configuration rows.
     * @throws {CLASSES.NodicsError} When the default database is unavailable or query fails.
     */
    getRuntimeSchema: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let defaultTenant = CONFIG.get('defaultTenant') || 'default';
                let db = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase('default', defaultTenant);
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

    /**
     * Closes a MongoDB client connection.
     *
     * @param {Object} connection Nodics database wrapper with a Mongo client.
     * @returns {undefined}
     * @sideEffects Closes the underlying Mongo client.
     */
    closeConnection: function (connection) {
        connection.getClient().close();
    }
};
