/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/src/service/transaction/defaultDatabaseTransactionService
 * @description Owns provider-neutral, module-and-tenant-scoped transaction execution and opaque context propagation.
 * @layer service
 * @owner nDatabase
 * @override Database adapters may implement transaction mechanics while preserving scope, opacity, fail-closed capability checks, and cleanup.
 */
const crypto = require('crypto');
const contexts = new WeakMap();

module.exports = {
    /** Resolves the configured database wrapper and adapter for one transaction scope. */
    resolve: function (input) {
        const tenant = String(input.tenant || '').trim();
        const moduleName = String(input.moduleName || '').trim();
        if (!tenant || !moduleName) throw new Error('Database transaction requires moduleName and tenant');
        const registered = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(moduleName, tenant);
        const database = registered && (input.test === true ? registered.test : registered.master);
        if (!database) throw new Error('Database transaction scope is unavailable: ' + moduleName + '/' + tenant);
        const handlerName = database.getOptions().connectionHandler;
        const handler = SERVICE[handlerName];
        if (!handler || typeof handler.transactionCapabilities !== 'function' ||
            typeof handler.executeTransaction !== 'function') {
            throw new Error('Database adapter does not implement transaction contract: ' + handlerName);
        }
        const capabilities = handler.transactionCapabilities(database);
        if (!capabilities || capabilities.multiRecordAtomic !== true) {
            throw new Error('Database adapter does not support atomic multi-record transactions: ' + handlerName);
        }
        return { tenant: tenant, moduleName: moduleName, database: database, handler: handler, capabilities: capabilities };
    },

    /** Reports the effective adapter transaction capability without starting a transaction. */
    capabilities: function (input) {
        try {
            return this.resolve(input).capabilities;
        } catch (error) {
            return { multiRecordAtomic: false, reason: error.message };
        }
    },

    /** Executes work in one adapter transaction and exposes only an opaque context token to callers. */
    execute: async function (input, work) {
        const configuration = CONFIG.get('databaseTransactions') || {};
        if (configuration.enabled !== true || configuration.failClosed !== true) {
            throw new Error('Database transactions are disabled or not fail closed');
        }
        if (!Number.isSafeInteger(configuration.maximumCommitTimeMs) ||
            configuration.maximumCommitTimeMs < 1) {
            throw new Error('Database transaction maximumCommitTimeMs must be a positive safe integer');
        }
        if (typeof work !== 'function') throw new Error('Database transaction requires a work callback');
        const resolved = this.resolve(input);
        return resolved.handler.executeTransaction(resolved.database, {
            maximumCommitTimeMs: configuration.maximumCommitTimeMs
        }, async adapterContext => {
            const token = Object.freeze({
                transactionId: crypto.randomUUID(),
                moduleName: resolved.moduleName,
                tenant: resolved.tenant
            });
            contexts.set(token, {
                database: resolved.database,
                handler: resolved.handler,
                adapterContext: adapterContext
            });
            try {
                return await work(token);
            } finally {
                contexts.delete(token);
            }
        });
    },

    /** Ensures one schema explicitly permits side-effect-safe transaction participation. */
    assertSchemaEligible: function (schemaModel) {
        const schema = schemaModel && schemaModel.rawSchema;
        if (!schema || !schema.transaction || schema.transaction.enabled !== true) {
            throw new Error('Schema is not enabled for database transactions');
        }
        if (schema.transaction.sideEffects !== 'none' ||
            (schema.cache && schema.cache.enabled === true) ||
            (schema.event && schema.event.enabled === true)) {
            throw new Error('Schema transaction requires deferred or disabled cache and event side effects');
        }
        return true;
    },

    /** Resolves adapter operation options for a valid context bound to the same eligible schema model. */
    operationOptions: function (transactionContext, database, schemaModel) {
        if (!transactionContext) return {};
        const registered = contexts.get(transactionContext);
        if (!registered || registered.database !== database) {
            throw new Error('Database transaction context is invalid, expired, or belongs to another database');
        }
        this.assertSchemaEligible(schemaModel);
        return registered.handler.transactionOperationOptions(registered.adapterContext);
    }
};
