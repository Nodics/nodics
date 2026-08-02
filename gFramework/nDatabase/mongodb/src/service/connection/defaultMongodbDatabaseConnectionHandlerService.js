/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
     * Returns transaction capability discovered from the live MongoDB topology.
     *
     * @param {Object} database Nodics database wrapper.
     * @returns {Object} Provider-neutral transaction capability.
     */
    transactionCapabilities: function (database) {
        let capabilities = database && typeof database.getCapabilities === 'function' ?
            database.getCapabilities() : {};
        let transaction = capabilities.transaction || {};
        return {
            multiRecordAtomic: transaction.multiRecordAtomic === true,
            contextPropagation: true,
            contractVersion: 1,
            reason: transaction.reason
        };
    },

    /**
     * Discovers whether the connected MongoDB topology can support transactions.
     *
     * @param {Object} db Connected MongoDB database.
     * @returns {Promise<Object>} Provider-neutral connection capabilities.
     */
    discoverCapabilities: async function (db) {
        let topology;
        try {
            topology = await db.command({ hello: 1 });
        } catch (error) {
            try {
                topology = await db.command({ isMaster: 1 });
            } catch (fallbackError) {
                return {
                    transaction: {
                        multiRecordAtomic: false,
                        reason: 'MongoDB topology discovery failed'
                    }
                };
            }
        }
        let sessionCapable = Number.isFinite(topology.logicalSessionTimeoutMinutes);
        let qualifiedTopology = typeof topology.setName === 'string' ||
            topology.msg === 'isdbgrid';
        return {
            transaction: {
                multiRecordAtomic: sessionCapable && qualifiedTopology,
                reason: sessionCapable && qualifiedTopology ? undefined :
                    'MongoDB transactions require logical sessions and a replica set or sharded cluster'
            }
        };
    },

    /** Returns MongoDB operation options without exposing the session to business callers. */
    transactionOperationOptions: function (adapterContext) {
        if (!adapterContext || !adapterContext.session) throw new Error('MongoDB transaction session is unavailable');
        return { session: adapterContext.session };
    },

    /** Executes one callback in a MongoDB client session transaction. */
    executeTransaction: async function (database, options, work) {
        let capability = this.transactionCapabilities(database);
        if (capability.multiRecordAtomic !== true) {
            throw new Error(capability.reason || 'MongoDB topology is not qualified for transactions');
        }
        const client = database && database.getClient();
        if (!client || typeof client.startSession !== 'function') {
            throw new Error('MongoDB client does not support sessions');
        }
        const session = client.startSession();
        let result;
        try {
            await session.withTransaction(async () => {
                result = await work({ session: session });
            }, {
                readConcern: { level: 'snapshot' },
                writeConcern: { w: 'majority' },
                maxCommitTimeMS: Number(options.maximumCommitTimeMs)
            });
            return result;
        } finally {
            await session.endSession();
        }
    },
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
                Promise.all([
                    db.listCollections({}, { nameOnly: true }).toArray(),
                    _self.discoverCapabilities(db)
                ]).then(results => {
                    let collections = results[0];
                    let capabilities = results[1];
                    resolve({
                        client: mongoClient,
                        connection: db,
                        collections: collections,
                        capabilities: capabilities
                    });
                }).catch(error => {
                    if (error) {
                        reject(new CLASSES.NodicsError(error, 'While fetching list of collections', 'ERR_DBS_00000'));
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
