/**
 * @module nService/test/AuthTokenInvalidationService
 * @description Verifies auth cache invalidation callbacks produce sanitized
 * observability without logging token material or cache keys.
 * @layer test
 * @owner nService
 * @override Project modules may extend invalidation publishing while preserving
 * credential-free logs and audit records.
 */
const assert = require('assert');

const service = require('../src/service/authentication/defaultAuthTokenInvalidationService');
let logs = [];
let audits = [];
service.LOG = {
    debug: function () { logs.push(Array.from(arguments)); },
    error: function () {}
};
global.SERVICE = {
    DefaultAuthAuditService: {
        record: function (event) {
            audits.push(event);
            return Promise.resolve(event);
        }
    }
};

let sensitiveKey = 'profile_auth_refresh-token-secret-value';
let sensitiveToken = 'refresh-token-secret-value';
service.publishTokenExpiredEvent(sensitiveKey, {
    tenant: 'tenant-a',
    entCode: 'enterprise-a',
    loginId: 'user-a',
    tokenType: 'refresh',
    refreshToken: sensitiveToken,
    authToken: 'access-token-secret-value',
    apiKey: 'api-key-secret-value'
}, { moduleName: 'profile', channelName: 'auth' });
service.publishTokenDeletedEvent(sensitiveKey, { tenant: 'tenant-a', serviceId: 'service-a' }, { moduleName: 'profile' });
service.publishTokenFlushedEvent({ moduleName: 'profile', tenant: 'tenant-a' });

let serializedLogs = JSON.stringify(logs);
let serializedAudits = JSON.stringify(audits);
assert.strictEqual(serializedLogs.includes(sensitiveKey), false, 'Invalidation logs must not include auth cache keys');
assert.strictEqual(serializedLogs.includes(sensitiveToken), false, 'Invalidation logs must not include refresh tokens');
assert.strictEqual(serializedLogs.includes('access-token-secret-value'), false, 'Invalidation logs must not include access tokens');
assert.strictEqual(serializedLogs.includes('api-key-secret-value'), false, 'Invalidation logs must not include API keys');
assert.strictEqual(serializedAudits.includes(sensitiveKey), false, 'Invalidation audit must not include auth cache keys');
assert.strictEqual(serializedAudits.includes(sensitiveToken), false, 'Invalidation audit must not include refresh tokens');
assert.strictEqual(audits[0].reasonCode, 'AUTH_TOKEN_EXPIRED');
assert.strictEqual(audits[0].tenant, 'tenant-a');
assert.strictEqual(audits[0].principalId, 'user-a');
assert.strictEqual(audits[1].reasonCode, 'AUTH_TOKEN_DELETED');
assert.strictEqual(audits[1].principalId, 'service-a');
assert.strictEqual(audits[2].reasonCode, 'AUTH_TOKEN_FLUSHED');

console.log('nService auth token invalidation observability validated');
