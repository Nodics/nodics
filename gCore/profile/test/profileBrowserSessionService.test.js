/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

let removed;
let consumed;
global.CONFIG = {
    get: key => {
        if (key === 'profileBrowserSession') return {
            enabled: true,
            refreshCookieName: 'refresh',
            csrfCookieName: 'csrf',
            cookiePath: '/nodics/profile/v0/employee/browser',
            csrfCookiePath: '/',
            sameSite: 'Strict',
            secure: true,
            maximumAgeSeconds: 3600
        };
        if (key === 'httpHardening') return {
            cors: {
                enabled: true,
                allowedOrigins: ['https://axis.example.com'],
                allowCredentials: true
            }
        };
        if (key === 'profileModuleName') return 'profile';
        return undefined;
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
global.SERVICE = {
    DefaultAuthenticationProviderService: {
        consumeToken: (moduleName, token) => {
            assert.strictEqual(moduleName, 'profile');
            consumed = { moduleName, token };
            if (token === 'missing-refresh') {
                return Promise.reject(Object.assign(new Error('Cache miss'), {
                    code: 'ERR_CACHE_00001'
                }));
            }
            if (token === 'lookup-failure') {
                return Promise.reject(Object.assign(new Error('Cache unavailable'), {
                    code: 'ERR_CACHE_00006'
                }));
            }
            return Promise.resolve({ loginId: 'admin' });
        },
        findToken: (moduleName, token) => {
            assert.strictEqual(moduleName, 'profile');
            return Promise.resolve({ loginId: 'admin', token });
        },
        rotateRefreshToken: request => {
            assert.strictEqual(request.refreshToken, 'old-refresh');
            assert.strictEqual(request.entCode, 'enterprise-a');
            return Promise.resolve({
                authToken: 'new-access',
                refreshToken: 'new-refresh',
                loginId: 'admin'
            });
        },
        removeToken: (moduleName, token) => {
            removed = { moduleName, token };
            return Promise.resolve(true);
        }
    }
};

const service = require('../src/service/authentication/defaultBrowserSessionService');

function request(headers) {
    let responseHeaders = {};
    return {
        httpRequest: { headers },
        httpResponse: {
            setHeader: (name, value) => {
                responseHeaders[name] = value;
            }
        },
        responseHeaders
    };
}

(async function () {
    let started = request({ origin: 'https://axis.example.com' });
    let startResult = await service.start(started, {
        authToken: 'access',
        refreshToken: 'refresh-token'
    });
    assert.strictEqual(startResult.authToken, 'access');
    assert(started.responseHeaders['Set-Cookie'][0].includes('HttpOnly'));
    assert(started.responseHeaders['Set-Cookie'][0].includes('Secure'));
    assert(started.responseHeaders['Set-Cookie'][0].includes('SameSite=Strict'));
    assert(!started.responseHeaders['Set-Cookie'][1].includes('HttpOnly'));
    assert.strictEqual(started.responseHeaders['Cache-Control'], 'no-store');
    assert.strictEqual(startResult.csrfToken, undefined);

    let replaced = request({
        origin: 'https://axis.example.com',
        cookie: 'refresh=previous-refresh'
    });
    replaced.loginId = 'admin';
    await service.start(replaced, {
        authToken: 'replacement-access',
        refreshToken: 'replacement-refresh'
    });
    assert.deepStrictEqual(consumed, {
        moduleName: 'profile',
        token: 'previous-refresh'
    });

    consumed = undefined;
    let stale = request({
        origin: 'https://axis.example.com',
        cookie: 'refresh=missing-refresh'
    });
    await service.start(stale, {
        authToken: 'replacement-access',
        refreshToken: 'replacement-refresh'
    });
    assert.deepStrictEqual(consumed, {
        moduleName: 'profile',
        token: 'missing-refresh'
    });
    assert(stale.responseHeaders['Set-Cookie'][0].includes('replacement-refresh'));

    await assert.rejects(async () => service.start(request({
        origin: 'https://axis.example.com',
        cookie: 'refresh=lookup-failure'
    }), {
        authToken: 'replacement-access',
        refreshToken: 'replacement-refresh'
    }), error => error.code === 'ERR_CACHE_00006');

    let restored = request({
        origin: 'https://axis.example.com',
        cookie: 'refresh=old-refresh; csrf=csrf-value',
        'x-csrf-token': 'csrf-value'
    });
    restored.entCode = 'enterprise-a';
    let restoredResult = await service.restore(restored);
    assert.strictEqual(restoredResult.authToken, 'new-access');
    assert.strictEqual(restoredResult.loginId, 'admin');
    assert(restored.responseHeaders['Set-Cookie'][0].includes('new-refresh'));

    await assert.rejects(async () => service.restore(request({
        origin: 'https://axis.example.com',
        cookie: 'refresh=old-refresh; csrf=csrf-value',
        'x-csrf-token': 'wrong'
    })), error => error.code === 'ERR_AUTH_00001');
    let originalGet = CONFIG.get;
    CONFIG.get = key => key === 'profileBrowserSession' ? {
        enabled: true,
        refreshCookieName: 'refresh',
        csrfCookieName: 'csrf',
        cookiePath: '/nodics/profile/v0/employee/browser',
        csrfCookiePath: '/',
        sameSite: 'Strict',
        secure: false,
        maximumAgeSeconds: 3600
    } : key === 'httpHardening' ? {
        cors: {
            enabled: true,
            allowedOrigins: ['https://axis.example.com'],
            allowCredentials: true
        }
    } : originalGet(key);
    await assert.rejects(async () => service.restore(request({
        origin: 'https://axis.example.com',
        cookie: 'refresh=old-refresh; csrf=csrf-value',
        'x-csrf-token': 'csrf-value'
    })), error => error.code === 'ERR_AUTH_00001');
    CONFIG.get = originalGet;
    await assert.rejects(async () => service.restore(request({
        origin: 'https://evil.example.com',
        cookie: 'refresh=old-refresh; csrf=csrf-value',
        'x-csrf-token': 'csrf-value'
    })), error => error.code === 'ERR_AUTH_00001');

    let loggedOut = request({
        origin: 'https://axis.example.com',
        cookie: 'refresh=old-refresh; csrf=csrf-value',
        'x-csrf-token': 'csrf-value'
    });
    loggedOut.entCode = 'enterprise-a';
    await service.logout(loggedOut);
    assert.deepStrictEqual(removed, { moduleName: 'profile', token: 'old-refresh' });
    assert(loggedOut.responseHeaders['Set-Cookie'].every(cookie => cookie.includes('Max-Age=0')));
    console.log('Profile browser session security contract validated');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
