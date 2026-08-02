/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/test/AiAssistantEnterpriseCreationAcceptance
 * @description Exercises clarification, current-contract mutation planning, persisted approval, Profile dispatch, replay, isolation, expiry, and uncertain failure.
 * @layer test
 * @owner aiAssistant
 */
const assert = require('assert');
const defaults = require('../config/properties').aiAssistant;
const confirmationService = require(
    '../src/service/confirmation/defaultAiAssistantConfirmationService'
);
const mutationService = require(
    '../src/service/tool/defaultAiAssistantMutationPlanningService'
);
const planningService = require('../src/service/tool/defaultAiAssistantToolPlanningService');

const records = [];
const profileRequests = [];
let profileFailure;

function clone(value) {
    return value === undefined ? value : structuredClone(value);
}

function matches(model, query) {
    return Object.keys(query || {}).every(key => model[key] === query[key]);
}

global.CONFIG = {
    get: key => key === 'aiAssistant' ? defaults : undefined
};
global.SERVICE = {
    DefaultAssistantConfirmationService: {
        save: input => {
            const model = clone(input.model);
            if (records.some(value => value.confirmationCode === model.confirmationCode ||
                value.idempotencyKey === model.idempotencyKey)) {
                return Promise.reject(new Error('duplicate confirmation'));
            }
            records.push(model);
            return Promise.resolve({ result: [clone(model)] });
        },
        get: input => Promise.resolve({
            result: records.filter(value => matches(value, input.query)).map(clone)
        }),
        update: input => {
            const target = records.find(value => matches(value, input.query));
            if (!target) return Promise.resolve({ result: { modifiedCount: 0 } });
            Object.assign(target, clone(input.model));
            return Promise.resolve({ result: { modifiedCount: 1 } });
        }
    },
    DefaultModuleService: {
        buildRequest: options => options,
        fetch: descriptor => {
            profileRequests.push(clone(descriptor));
            if (profileFailure) return Promise.reject(profileFailure);
            return Promise.resolve({
                data: {
                    data: {
                        enterprise: Object.assign({}, descriptor.requestBody, {
                            idempotencyKey: undefined
                        })
                    }
                }
            });
        }
    }
};

const policy = {
    contractVersion: 1,
    enabled: true,
    approvedOperations: [{
        toolId: 'profile.enterprise.create',
        ownerModule: 'profile',
        operationId: 'profile_createenterprise',
        mode: 'MUTATION',
        confirmationRequired: true,
        requiredPermissions: ['profile.enterprise.create'],
        inputSchema: {
            type: 'object', additionalProperties: false, required: ['code', 'name']
        }
    }]
};
const bootstrap = {
    catalogue: {
        profile: {
            contract: {
                operations: [{
                    operationId: 'profile_createenterprise',
                    method: 'POST',
                    permissions: ['profile.enterprise.create']
                }]
            }
        }
    }
};
const request = {
    tenant: 'default',
    authToken: 'employee-access-token',
    enterpriseCode: 'default',
    idempotencyKey: 'enterprise-acceptance-turn',
    authData: {
        principalType: 'human',
        loginId: 'admin',
        entCode: 'default',
        permissions: ['profile.enterprise.create'],
        userGroups: ['employeeUserGroup']
    }
};
const turn = {
    conversationCode: 'conversation-acceptance',
    turnCode: 'turn-acceptance'
};
const runtime = {
    configuration: { tools: Object.assign({}, defaults.tools) },
    toolPolicy: policy,
    backofficeCatalogueProvider: () => Promise.resolve(bootstrap),
    confirmationService: confirmationService
};

function proposal(argumentsValue, suffix) {
    return planningService.parse(JSON.stringify({
        contractVersion: 1,
        type: 'MUTATION_PROPOSAL',
        toolId: 'profile.enterprise.create',
        ownerModule: 'profile',
        operationId: 'profile_createenterprise',
        arguments: argumentsValue
    }), defaults, suffix);
}

async function run() {
    const clarification = await mutationService.process(
        proposal({ code: 'acme' }), turn, request, runtime
    );
    assert.strictEqual(clarification.eventType, 'CLARIFICATION');
    assert.deepStrictEqual(clarification.data.missingFields, ['name']);
    assert.strictEqual(records.length, 0);

    const proposed = await mutationService.process(
        proposal({ code: 'acme', name: 'Acme', tenantCode: 'default' }),
        turn, request, runtime
    );
    const projected = proposed.data.confirmation;
    assert.strictEqual(proposed.eventType, 'CONFIRMATION_REQUIRED');
    assert.strictEqual(projected.state, 'PENDING');
    assert.strictEqual(projected.arguments, undefined);
    assert.strictEqual(records.length, 1);

    const staleRequest = Object.assign({}, request, {
        confirmationCode: projected.confirmationCode,
        body: {
            expectedRevision: 1,
            argumentsDigest: projected.argumentsDigest
        }
    });
    await assert.rejects(
        confirmationService.approve(staleRequest),
        error => error.code === 'ERR_AIA_00007'
    );

    const approved = await confirmationService.approve(Object.assign(
        {}, staleRequest, {
            body: {
                expectedRevision: 0,
                argumentsDigest: projected.argumentsDigest
            }
        }
    ));
    assert.strictEqual(approved.data.confirmation.state, 'APPROVED');
    assert.strictEqual(approved.data.confirmation.revision, 1);

    const executed = await confirmationService.execute(Object.assign({}, request, {
        confirmationCode: projected.confirmationCode
    }));
    assert.strictEqual(executed.data.state, 'CONSUMED');
    assert.strictEqual(profileRequests.length, 1);
    assert.strictEqual(profileRequests[0].moduleName, 'profile');
    assert.strictEqual(profileRequests[0].apiName, '/enterprises');
    assert.strictEqual(profileRequests[0].methodName, 'POST');
    assert.strictEqual(
        profileRequests[0].header.Authorization,
        'employee-access-token'
    );
    assert.strictEqual(profileRequests[0].requestBody.code, 'acme');
    assert(profileRequests[0].requestBody.idempotencyKey);

    await assert.rejects(
        confirmationService.execute(Object.assign({}, request, {
            confirmationCode: projected.confirmationCode
        })),
        error => error.code === 'ERR_AIA_00007'
    );
    await assert.rejects(
        confirmationService.load(Object.assign({}, request, {
            tenant: 'another',
            confirmationCode: projected.confirmationCode
        })),
        error => error.code === 'ERR_AIA_00001'
    );

    const expiring = await mutationService.process(
        proposal({ code: 'expired', name: 'Expired' }),
        Object.assign({}, turn, { turnCode: 'turn-expired' }),
        Object.assign({}, request, { idempotencyKey: 'expired-turn' }),
        runtime
    );
    records.find(value =>
        value.confirmationCode === expiring.data.confirmation.confirmationCode
    ).expiresAt = new Date(Date.now() - 1);
    await assert.rejects(
        confirmationService.approve(Object.assign({}, request, {
            confirmationCode: expiring.data.confirmation.confirmationCode,
            body: {
                expectedRevision: 0,
                argumentsDigest: expiring.data.confirmation.argumentsDigest
            }
        })),
        error => error.code === 'ERR_AIA_00008'
    );
    const expiredProjection = await confirmationService.get(Object.assign({}, request, {
        confirmationCode: expiring.data.confirmation.confirmationCode
    }));
    assert.strictEqual(expiredProjection.data.confirmation.state, 'EXPIRED');
    assert.strictEqual(expiredProjection.data.confirmation.arguments, undefined);

    const rejected = await mutationService.process(
        proposal({ code: 'rejected', name: 'Rejected' }),
        Object.assign({}, turn, { turnCode: 'turn-rejected' }),
        Object.assign({}, request, { idempotencyKey: 'rejected-turn' }),
        runtime
    );
    const rejectedResult = await confirmationService.reject(Object.assign({}, request, {
        confirmationCode: rejected.data.confirmation.confirmationCode,
        body: {
            expectedRevision: 0,
            argumentsDigest: rejected.data.confirmation.argumentsDigest,
            reason: 'Employee cancelled the change'
        }
    }));
    assert.strictEqual(rejectedResult.data.confirmation.state, 'REJECTED');
    assert.strictEqual(rejectedResult.data.confirmation.revision, 1);
    assert.strictEqual(rejectedResult.data.confirmation.arguments, undefined);
    await assert.rejects(
        confirmationService.reject(Object.assign({}, request, {
            confirmationCode: rejected.data.confirmation.confirmationCode,
            body: {
                expectedRevision: 0,
                argumentsDigest: rejected.data.confirmation.argumentsDigest
            }
        })),
        error => error.code === 'ERR_AIA_00007'
    );
    await assert.rejects(
        confirmationService.execute(Object.assign({}, request, {
            confirmationCode: rejected.data.confirmation.confirmationCode
        })),
        error => error.code === 'ERR_AIA_00007'
    );

    const duplicate = await mutationService.process(
        proposal({ code: 'acme', name: 'Duplicate Acme' }),
        Object.assign({}, turn, { turnCode: 'turn-duplicate' }),
        Object.assign({}, request, { idempotencyKey: 'duplicate-turn' }),
        runtime
    );
    await confirmationService.approve(Object.assign({}, request, {
        confirmationCode: duplicate.data.confirmation.confirmationCode,
        body: {
            expectedRevision: 0,
            argumentsDigest: duplicate.data.confirmation.argumentsDigest
        }
    }));
    profileFailure = Object.assign(new Error('enterprise already exists'), {
        code: 'ERR_PRFL_00003'
    });
    await assert.rejects(
        confirmationService.execute(Object.assign({}, request, {
            confirmationCode: duplicate.data.confirmation.confirmationCode
        })),
        /enterprise already exists/
    );
    assert.strictEqual(records.find(value =>
        value.confirmationCode === duplicate.data.confirmation.confirmationCode
    ).state, 'UNCERTAIN');
    profileFailure = undefined;

    const uncertain = await mutationService.process(
        proposal({ code: 'uncertain', name: 'Uncertain' }),
        Object.assign({}, turn, { turnCode: 'turn-uncertain' }),
        Object.assign({}, request, { idempotencyKey: 'uncertain-turn' }),
        runtime
    );
    await confirmationService.approve(Object.assign({}, request, {
        confirmationCode: uncertain.data.confirmation.confirmationCode,
        body: {
            expectedRevision: 0,
            argumentsDigest: uncertain.data.confirmation.argumentsDigest
        }
    }));
    profileFailure = Object.assign(new Error('target outcome unavailable'), {
        code: 'TARGET_UNAVAILABLE'
    });
    await assert.rejects(
        confirmationService.execute(Object.assign({}, request, {
            confirmationCode: uncertain.data.confirmation.confirmationCode
        })),
        /target outcome unavailable/
    );
    assert.strictEqual(records.find(value =>
        value.confirmationCode === uncertain.data.confirmation.confirmationCode
    ).state, 'UNCERTAIN');

    console.log('AI Assistant enterprise creation end-to-end acceptance validated');
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
