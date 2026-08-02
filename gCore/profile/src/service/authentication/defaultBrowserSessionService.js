/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');

/**
 * @module gCore/profile/src/service/authentication/defaultBrowserSessionService
 * @description Owns Profile browser refresh cookies, CSRF validation, rotation, and logout.
 * @layer service
 * @owner profile
 * @override Projects may layer cookie policy while preserving HttpOnly refresh, exact-origin, CSRF, and rotation guarantees.
 */
module.exports = {
    /** Returns and validates the effective browser-session configuration. */
    config: function () {
        let config = CONFIG.get('profileBrowserSession') || {};
        if (config.enabled !== true) {
            throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Browser sessions are disabled');
        }
        let names = [config.refreshCookieName, config.csrfCookieName];
        let sameSite = ['Strict', 'Lax', 'None'];
        if (names.some(name => typeof name !== 'string' ||
            !/^[A-Za-z0-9_-]{1,64}$/.test(name)) ||
            names[0] === names[1] ||
            typeof config.cookiePath !== 'string' ||
            !config.cookiePath.startsWith('/') ||
            typeof config.csrfCookiePath !== 'string' ||
            !config.csrfCookiePath.startsWith('/') ||
            !sameSite.includes(config.sameSite) ||
            !Number.isInteger(config.maximumAgeSeconds) ||
            config.maximumAgeSeconds < 60 ||
            typeof config.secure !== 'boolean' ||
            (config.sameSite === 'None' && config.secure !== true)) {
            throw new CLASSES.NodicsError(
                'ERR_AUTH_00001', 'Browser session configuration is invalid'
            );
        }
        return config;
    },

    /** Parses request cookies into a decoded name-value map. */
    cookies: function (request) {
        let header = request.httpRequest && request.httpRequest.headers &&
            request.httpRequest.headers.cookie || '';
        return String(header).split(';').reduce((result, item) => {
            let index = item.indexOf('=');
            if (index > 0) {
                let name = item.slice(0, index).trim();
                let value = item.slice(index + 1).trim();
                if (name) {
                    try {
                        result[name] = decodeURIComponent(value);
                    } catch (error) {
                        throw new CLASSES.NodicsError(
                            'ERR_AUTH_00001', 'Browser session cookie is invalid'
                        );
                    }
                }
            }
            return result;
        }, {});
    },

    /** Enforces the configured credentialed browser origin policy. */
    validateOrigin: function (request, config) {
        let origin = request.httpRequest && request.httpRequest.headers &&
            request.httpRequest.headers.origin;
        let cors = CONFIG.get('httpHardening') && CONFIG.get('httpHardening').cors || {};
        if (cors.enabled !== true || cors.allowCredentials !== true ||
            !origin || !Array.isArray(cors.allowedOrigins) ||
            cors.allowedOrigins.includes('*') || !cors.allowedOrigins.includes(origin)) {
            throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Browser session origin is not allowed');
        }
        let parsed;
        try {
            parsed = new URL(origin);
        } catch (error) {
            throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Browser session origin is invalid');
        }
        let loopback = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
        if (config.secure !== true && (!loopback || parsed.protocol !== 'http:')) {
            throw new CLASSES.NodicsError(
                'ERR_AUTH_00001',
                'Non-secure browser cookies are allowed only for loopback HTTP development'
            );
        }
        if (config.secure === true && parsed.protocol !== 'https:') {
            throw new CLASSES.NodicsError(
                'ERR_AUTH_00001', 'Secure browser sessions require an HTTPS origin'
            );
        }
    },

    /** Compares two bounded security values in constant time. */
    equal: function (left, right) {
        if (!left || !right) return false;
        let a = Buffer.from(String(left));
        let b = Buffer.from(String(right));
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    },

    /** Validates the double-submit CSRF token for a browser-session request. */
    validateCsrf: function (request, config, cookies) {
        let header = request.httpRequest && request.httpRequest.headers &&
            request.httpRequest.headers['x-csrf-token'];
        if (!this.equal(header, cookies[config.csrfCookieName])) {
            throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Browser session CSRF validation failed');
        }
    },

    /** Serializes one browser cookie using the supplied security attributes. */
    cookie: function (name, value, options) {
        let parts = [
            name + '=' + encodeURIComponent(value),
            'Path=' + options.path,
            'SameSite=' + options.sameSite,
            'Max-Age=' + String(options.maximumAgeSeconds)
        ];
        if (options.httpOnly) parts.push('HttpOnly');
        if (options.secure) parts.push('Secure');
        return parts.join('; ');
    },

    /** Writes rotated refresh and CSRF cookies to the response. */
    write: function (request, refreshToken, csrfToken, config) {
        request.httpResponse.setHeader('Cache-Control', 'no-store');
        request.httpResponse.setHeader('Set-Cookie', [
            this.cookie(config.refreshCookieName, refreshToken, {
                path: config.cookiePath,
                sameSite: config.sameSite,
                maximumAgeSeconds: config.maximumAgeSeconds,
                httpOnly: true,
                secure: config.secure
            }),
            this.cookie(config.csrfCookieName, csrfToken, {
                path: config.csrfCookiePath,
                sameSite: config.sameSite,
                maximumAgeSeconds: config.maximumAgeSeconds,
                httpOnly: false,
                secure: config.secure
            })
        ]);
    },

    /** Expires browser-session cookies without retaining credential material. */
    clear: function (request, config) {
        request.httpResponse.setHeader('Cache-Control', 'no-store');
        request.httpResponse.setHeader('Set-Cookie', [
            this.cookie(config.refreshCookieName, '', {
                path: config.cookiePath, sameSite: config.sameSite,
                maximumAgeSeconds: 0, httpOnly: true, secure: config.secure
            }),
            this.cookie(config.csrfCookieName, '', {
                path: config.csrfCookiePath, sameSite: config.sameSite,
                maximumAgeSeconds: 0, httpOnly: false, secure: config.secure
            })
        ]);
    },

    /**
     * Revokes a previous browser refresh token when it still exists.
     * A cache miss means the token was already expired, consumed, or lost with
     * an in-memory development runtime restart. Every other lookup or
     * revocation failure remains fail-closed.
     */
    revokePreviousRefreshToken: function (token) {
        if (!token) return Promise.resolve(false);
        let authentication = SERVICE.DefaultAuthenticationProviderService;
        let moduleName = CONFIG.get('profileModuleName') || 'profile';
        return authentication.consumeToken(moduleName, token).then(() => true).catch(error => {
            if (error && error.code === 'ERR_CACHE_00001') return false;
            throw error;
        });
    },

    /** Starts a browser session after origin validation and token rotation. */
    start: function (request, tokens) {
        let config = this.config();
        this.validateOrigin(request, config);
        if (!tokens || !tokens.authToken || !tokens.refreshToken) {
            throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Browser session tokens are invalid');
        }
        let existingRefreshToken = this.cookies(request)[config.refreshCookieName];
        let revoke = this.revokePreviousRefreshToken(existingRefreshToken);
        return revoke.then(() => {
            let csrfToken = crypto.randomBytes(32).toString('base64url');
            this.write(request, tokens.refreshToken, csrfToken, config);
            return {
                authToken: tokens.authToken,
                loginId: request.loginId
            };
        });
    },

    /** Restores a browser session through the Profile-owned refresh contract. */
    restore: function (request) {
        let config = this.config();
        this.validateOrigin(request, config);
        let cookies = this.cookies(request);
        this.validateCsrf(request, config, cookies);
        if (!cookies[config.refreshCookieName]) {
            throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Browser session is unavailable');
        }
        return SERVICE.DefaultAuthenticationProviderService.rotateRefreshToken({
            refreshToken: cookies[config.refreshCookieName],
            entCode: request.entCode
        }).then(tokens => {
            let csrfToken = crypto.randomBytes(32).toString('base64url');
            this.write(request, tokens.refreshToken, csrfToken, config);
            return {
                authToken: tokens.authToken,
                loginId: tokens.loginId
            };
        });
    },

    /** Revokes the refresh credential and clears the browser session. */
    logout: function (request) {
        let config = this.config();
        this.validateOrigin(request, config);
        let cookies = this.cookies(request);
        this.validateCsrf(request, config, cookies);
        let refreshToken = cookies[config.refreshCookieName];
        let operation = refreshToken ?
            SERVICE.DefaultAuthenticationProviderService.removeToken(
                CONFIG.get('profileModuleName') || 'profile', refreshToken
            ) : Promise.resolve();
        return operation.then(() => {
            this.clear(request, config);
            return true;
        });
    }
};
