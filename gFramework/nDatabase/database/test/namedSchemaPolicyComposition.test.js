/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/test/namedSchemaPolicyComposition
 * @description Verifies named schema policies compose through layered
 * configuration, materialize the existing access/ownership contract, allow
 * extension and removal, preserve explicit schema overrides, and fail closed
 * for unknown policy names.
 * @layer test
 * @owner nDatabase
 */

const assert = require('assert');

let schemaPolicies = {
    profile: {
        customerOwned: {
            accessGroups: {
                adminGroup: 10,
                customerUserGroup: 10,
                partnerSupportUserGroup: 2
            },
            ownership: {
                enabled: true,
                ownerProperty: 'ownerId',
                bypassGroups: {
                    adminGroup: true,
                    partnerAdminUserGroup: true,
                    removedLegacyGroup: false
                },
                subjectGroups: {
                    customerUserGroup: true
                },
                principalTypes: {
                    customer: true
                }
            }
        }
    }
};

global.CONFIG = {
    get: key => key === 'schemaPolicies' ? schemaPolicies : undefined
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

const service = require('../src/service/schema/defaultDatabaseSchemaHandlerService');

let schemas = service.applyNamedSchemaPolicies('profile', {
    address: {
        schemaPolicies: ['customerOwned'],
        accessGroups: {
            addressSpecialistUserGroup: 3
        },
        definition: {}
    }
});

assert.deepStrictEqual(schemas.address.accessGroups, {
    adminGroup: 10,
    customerUserGroup: 10,
    partnerSupportUserGroup: 2,
    addressSpecialistUserGroup: 3
});
assert.deepStrictEqual(schemas.address.ownership.bypassGroups,
    ['adminGroup', 'partnerAdminUserGroup']);
assert.deepStrictEqual(schemas.address.ownership.subjectGroups, ['customerUserGroup']);
assert.deepStrictEqual(schemas.address.ownership.principalTypes, ['customer']);
assert.deepStrictEqual(schemaPolicies.profile.customerOwned.ownership.bypassGroups, {
    adminGroup: true,
    partnerAdminUserGroup: true,
    removedLegacyGroup: false
}, 'materialization must not mutate layered configuration');

assert.throws(() => service.applyNamedSchemaPolicies('profile', {
    invalid: {
        schemaPolicies: ['missingPolicy']
    }
}), error => error.code === 'ERR_DBS_00003');

console.log('Named schema policy composition validated');
