const assert = require('assert');

global.CONFIG = {
    get: function (key) {
        if (key === 'schemaAccessPolicy') {
            return {
                policyTenant: 'default'
            };
        }
        if (key === 'defaultTenant') {
            return 'default';
        }
        return undefined;
    }
};

global.SERVICE = {
    DefaultSchemaAccessPolicyContractService: require('../src/service/access/defaultSchemaAccessPolicyContractService')
};

const service = require('../src/service/access/defaultSchemaAccessPolicyResolverService');

let context = {
    tenant: 'electronics',
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'productCode',
    action: 'read',
    userGroups: ['catalogViewerUserGroup'],
    now: '2026-06-15T00:00:00.000Z'
};

let policies = [{
    code: 'schemaDefaultAllow',
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: '*',
    actions: ['read'],
    effect: 'ALLOW',
    priority: 10
}, {
    code: 'propertyMask',
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'productCode',
    actions: ['read'],
    effect: 'MASK',
    priority: 20,
    maskStrategy: 'last4'
}];

let decision = service.resolveFromPolicies(context, policies);
assert.strictEqual(decision.allowed, true);
assert.strictEqual(decision.effect, 'MASK');
assert.strictEqual(decision.maskStrategy, 'last4');
assert.strictEqual(decision.policyCode, 'propertyMask');

decision = service.resolveFromPolicies(context, policies.concat([{
    code: 'tenantAllow',
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'productCode',
    actions: ['read'],
    effect: 'ALLOW',
    appliesToTenants: ['electronics'],
    priority: 100
}]));
assert.strictEqual(decision.effect, 'ALLOW');
assert.strictEqual(decision.policyCode, 'tenantAllow');

decision = service.resolveFromPolicies(context, [{
    code: 'openMask',
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'productCode',
    actions: ['read'],
    effect: 'MASK',
    priority: 1
}, {
    code: 'viewerHide',
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'productCode',
    userGroups: ['catalogViewerUserGroup'],
    actions: ['read'],
    effect: 'HIDE',
    priority: 100
}]);
assert.strictEqual(decision.effect, 'HIDE');
assert.strictEqual(decision.policyCode, 'viewerHide');

decision = service.resolveFromPolicies(context, [{
    code: 'higherPriorityNumber',
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'productCode',
    actions: ['read'],
    effect: 'MASK',
    priority: 50
}, {
    code: 'lowerPriorityNumber',
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'productCode',
    actions: ['read'],
    effect: 'HIDE',
    priority: 10
}]);
assert.strictEqual(decision.effect, 'HIDE');
assert.strictEqual(decision.policyCode, 'lowerPriorityNumber');

decision = service.resolveFromPolicies(context, [{
    code: 'allowTie',
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'productCode',
    actions: ['read'],
    effect: 'ALLOW',
    priority: 10
}, {
    code: 'denyTie',
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'productCode',
    actions: ['read'],
    effect: 'DENY',
    priority: 10
}]);
assert.strictEqual(decision.allowed, false);
assert.strictEqual(decision.effect, 'DENY');
assert.strictEqual(decision.policyCode, 'denyTie');

decision = service.resolveFromPolicies(context, [{
    code: 'inactiveDeny',
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'productCode',
    actions: ['read'],
    effect: 'DENY',
    status: 'INACTIVE'
}, {
    code: 'futureDeny',
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'productCode',
    actions: ['read'],
    effect: 'DENY',
    effectiveFrom: '2026-07-01T00:00:00.000Z'
}, {
    code: 'expiredDeny',
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'productCode',
    actions: ['read'],
    effect: 'DENY',
    effectiveUntil: '2026-06-01T00:00:00.000Z'
}]);
assert.strictEqual(decision.allowed, true);
assert.strictEqual(decision.effect, 'ALLOW');
assert.strictEqual(decision.policyCode, undefined);
assert.strictEqual(decision.matchedPolicies.length, 0);

global.SERVICE.DefaultSchemaAccessPolicyService = {
    get: function (request) {
        assert.strictEqual(request.tenant, 'default');
        assert.deepStrictEqual(request.query, {
            moduleName: 'catalog',
            schemaName: 'product'
        });
        return Promise.resolve({
            result: [{
                code: 'dbMask',
                moduleName: 'catalog',
                schemaName: 'product',
                propertyName: 'productDescription',
                actions: ['read'],
                effect: 'MASK',
                appliesToTenants: ['electronics']
            }]
        });
    }
};

service.resolveAccess({}, Object.assign({}, context, {
    propertyName: 'productDescription'
})).then(dbDecision => {
    assert.strictEqual(dbDecision.effect, 'MASK');
    assert.strictEqual(dbDecision.policyCode, 'dbMask');
    assert.strictEqual(dbDecision.context.tenant, 'electronics');
    global.CONFIG = {
        get: function (key) {
            if (key === 'schemaAccessPolicy') {
                return {
                    policyTenant: 'policyStore'
                };
            }
            if (key === 'defaultTenant') {
                return 'default';
            }
            return undefined;
        }
    };
    global.NODICS = {
        getActiveChannel: function () {
            return 'master';
        },
        getModule: function () {
            return {
                models: {
                    policyStore: {
                        master: {}
                    }
                }
            };
        }
    };
    global.SERVICE.DefaultSchemaAccessPolicyService = {
        get: function () {
            throw new Error('Policy service should not be queried before tenant model is available');
        }
    };
    return service.resolveAccess({}, Object.assign({}, context, {
        tenant: 'newTenant',
        propertyName: 'productDescription'
    }));
}).then(bootstrapDecision => {
    assert.strictEqual(bootstrapDecision.allowed, true);
    assert.strictEqual(bootstrapDecision.effect, 'ALLOW');
    assert.strictEqual(bootstrapDecision.policyCode, undefined);
    console.log('Schema access policy resolver service validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
