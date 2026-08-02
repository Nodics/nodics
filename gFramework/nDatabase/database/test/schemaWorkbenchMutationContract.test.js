/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/test/schemaWorkbenchMutationContract
 * @description Verifies opt-in bulk mutation, delete-impact inspection,
 * idempotency, bounded input, and aggregate delegation ownership.
 * @layer test
 * @owner nDatabase
 */

const assert = require('assert');

let removed;
let inspected;
let aggregated;
const schemaModel = {};
const moduleObject = {
    rawSchema: {
        address: {
            model: true,
            accessGroups: { adminGroup: 10 },
            backoffice: {
                operations: ['search', 'read', 'delete'],
                bulkOperations: ['DELETE'],
                aggregateOperations: {
                    SAVE_WITH_RELATIONSHIPS: {
                        service: 'DefaultAddressAggregateService',
                        operation: 'saveWithRelationships',
                        purpose: 'SAVE_WITH_RELATIONSHIPS',
                        consistency: 'ATOMIC'
                    }
                }
            },
            definition: {
                code: { type: 'string', primary: true }
            }
        }
    }
};

global.CONFIG = {
    get: key => {
        if (key === 'accessPoints') {
            return { readAccessPoint: 1, writeAccessPoint: 2, removeAccessPoint: 3 };
        }
        if (key === 'schemaWorkbench') {
            return {
                discoverModelsByDefault: true,
                defaultModelOperations: ['search', 'read'],
                defaultMutationMode: 'GENERATED_CRUD',
                defaultPageSize: 25,
                allowedPageSizes: [10, 25, 50],
                maximumPageSize: 50,
                maximumBulkItems: 2,
                maximumAggregatePayloadBytes: 1000
            };
        }
        return undefined;
    }
};
global.NODICS = {
    getModule: () => moduleObject,
    getModels: () => ({ addressModel: schemaModel })
};
global.UTILS = { createModelName: () => 'addressModel' };
global.SERVICE = {
    DefaultSchemaAccessHandlerService: { getAccessPoint: () => 10 },
    DefaultAddressService: {
        remove: input => {
            removed = input;
            return Promise.resolve({ count: 2 });
        }
    },
    DefaultReferenceIntegrityService: {
        inspectRemove: input => {
            inspected = input;
            return Promise.resolve({
                targetCount: 1, blocked: false, relationships: []
            });
        }
    },
    DefaultAddressAggregateService: {
        saveWithRelationships: input => {
            aggregated = input;
            return Promise.resolve({ code: 'DXB' });
        }
    }
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
};

const service = require('../src/service/schema/defaultSchemaWorkbenchService');
const request = {
    moduleName: 'profile',
    tenant: 'default',
    authData: { userGroups: ['adminGroup'] },
    headers: { 'idempotency-key': 'axis-test-0001' }
};

(async function () {
    let impact = await service.previewDeleteImpact({
        ...request,
        httpRequest: {
            params: { schema: 'address' },
            body: { identity: { code: 'DXB' } }
        }
    });
    assert.strictEqual(impact.data.blocked, false);
    assert.strictEqual(inspected.schemaModel, schemaModel);
    assert.deepStrictEqual(inspected.query, { code: 'DXB' });
    assert.strictEqual(inspected.tenant, 'default');

    await service.deleteRecord({
        ...request,
        httpRequest: {
            params: { schema: 'address' },
            body: { identity: { code: 'DXB' } }
        }
    });
    assert.deepStrictEqual(removed.query, { code: 'DXB' });
    assert.strictEqual(removed.idempotencyKey, 'axis-test-0001');
    assert.strictEqual(removed.tenant, 'default');

    await service.bulk({
        ...request,
        httpRequest: {
            params: { schema: 'address' },
            body: {
                operation: 'DELETE',
                identities: [{ code: 'DXB' }, { code: 'AUH' }]
            }
        }
    });
    assert.deepStrictEqual(removed.query, { code: { $in: ['DXB', 'AUH'] } });
    assert.strictEqual(removed.idempotencyKey, 'axis-test-0001');
    assert.strictEqual(removed.tenant, 'default');

    assert.throws(() => service.bulk({
        ...request,
        headers: {},
        httpRequest: {
            params: { schema: 'address' },
            body: { operation: 'DELETE', identities: [{ code: 'DXB' }] }
        }
    }), error => error.code === 'ERR_DBS_00003');
    assert.throws(() => service.bulk({
        ...request,
        httpRequest: {
            params: { schema: 'address' },
            body: {
                operation: 'DELETE',
                identities: [{ code: '1' }, { code: '2' }, { code: '3' }]
            }
        }
    }), error => error.code === 'ERR_DBS_00003');

    let aggregate = await service.aggregate({
        ...request,
        httpRequest: {
            params: { schema: 'address' },
            body: {
                operation: 'SAVE_WITH_RELATIONSHIPS',
                payload: { code: 'DXB' }
            }
        }
    });
    assert.deepStrictEqual(aggregate.data, { code: 'DXB' });
    assert.deepStrictEqual(aggregated.payload, { code: 'DXB' });
    assert.strictEqual(aggregated.idempotencyKey, 'axis-test-0001');
    assert.strictEqual(aggregated.tenant, 'default');

    await service.previewDeleteImpact({
        ...request,
        tenant: 'tenant-two',
        httpRequest: {
            params: { schema: 'address' },
            body: { identity: { code: 'DXB' } }
        }
    });
    assert.strictEqual(inspected.tenant, 'tenant-two',
        'Workbench must forward the authenticated request tenant unchanged');

    await assert.rejects(service.aggregate({
        ...request,
        httpRequest: {
            params: { schema: 'address' },
            body: {
                operation: 'SAVE_WITH_RELATIONSHIPS',
                payload: { content: 'x'.repeat(1100) }
            }
        }
    }), error => error.code === 'ERR_DBS_00004');

    console.log('Schema Workbench mutation contract tests passed');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
