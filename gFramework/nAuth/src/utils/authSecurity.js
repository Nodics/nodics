const _ = require('lodash');
const { v4: uuid } = require('uuid');

const INSECURE_SECRETS = ['nodics', 'secret', 'password', 'changeme'];

function read(config, key) {
    return config && typeof config.get === 'function' ? config.get(key) : undefined;
}

function getSecurityConfiguration(config) {
    return _.merge({
        jwt: {
            minimumSecretLength: 32,
            issuer: 'nodics',
            audience: 'nodics-services',
            algorithms: ['HS256'],
            accessTokenExpiresIn: '3h',
            serviceTokenExpiresIn: '15m'
        },
        compatibility: {
            allowInsecureDevelopmentSecret: false,
            allowNonExpiringTokens: false
        }
    }, read(config, 'authSecurity') || {});
}

function getJwtSecret(config) {
    const security = getSecurityConfiguration(config);
    const secret = security.jwt.secret || read(config, 'jwtSecretKey');
    const insecure = typeof secret !== 'string' ||
        secret.length < security.jwt.minimumSecretLength ||
        INSECURE_SECRETS.includes(secret.toLowerCase());
    if (insecure && security.compatibility.allowInsecureDevelopmentSecret !== true) {
        throw new Error('A strong JWT secret must be supplied through layered authSecurity.jwt.secret configuration');
    }
    return secret;
}

function getSignOptions(config, options) {
    const security = getSecurityConfiguration(config);
    const profile = read(config, 'profile') || {};
    const tokenType = options.tokenType || (options.serviceId ? 'service' : 'access');
    const signOptions = _.merge({}, profile.jwtSignOptions || {}, security.jwt.signOptions || {});
    signOptions.algorithm = signOptions.algorithm || security.jwt.algorithms[0];
    signOptions.issuer = signOptions.issuer || security.jwt.issuer;
    signOptions.audience = signOptions.audience || security.jwt.audience;
    signOptions.jwtid = options.jti || uuid();
    signOptions.subject = options.subject || options.loginId || options.serviceId || tokenType;
    if (options.tokenLife) {
        signOptions.expiresIn = options.tokenLife;
    } else if (!signOptions.expiresIn) {
        signOptions.expiresIn = tokenType === 'service' ? security.jwt.serviceTokenExpiresIn : security.jwt.accessTokenExpiresIn;
    }
    if (options.lifetime === true) {
        if (security.compatibility.allowNonExpiringTokens !== true) {
            throw new Error('Non-expiring authentication tokens are disabled');
        }
        delete signOptions.expiresIn;
    }
    return signOptions;
}

function getVerifyOptions(config) {
    const security = getSecurityConfiguration(config);
    const profile = read(config, 'profile') || {};
    const verifyOptions = _.merge({}, profile.jwtVerifyOptions || {}, security.jwt.verifyOptions || {});
    if (verifyOptions.algorithm && !verifyOptions.algorithms) {
        verifyOptions.algorithms = Array.isArray(verifyOptions.algorithm) ? verifyOptions.algorithm : [verifyOptions.algorithm];
    }
    delete verifyOptions.algorithm;
    verifyOptions.algorithms = verifyOptions.algorithms || security.jwt.algorithms;
    verifyOptions.issuer = verifyOptions.issuer || security.jwt.issuer;
    verifyOptions.audience = verifyOptions.audience || security.jwt.audience;
    return verifyOptions;
}

function buildPayload(options) {
    const tokenType = options.tokenType || (options.serviceId ? 'service' : 'access');
    const payload = {
        entCode: options.entCode,
        tenant: options.tenant,
        tokenType: tokenType
    };
    if (options.loginId) payload.loginId = options.loginId;
    if (options.serviceId) payload.serviceId = options.serviceId;
    if (options.principalType) payload.principalType = options.principalType;
    if (options.userGroups && options.userGroups.length > 0) payload.userGroups = options.userGroups;
    if (options.permissions && options.permissions.length > 0) payload.permissions = options.permissions;
    if (options.authVersion !== undefined) payload.authVersion = options.authVersion;
    return payload;
}

/**
 * @module gFramework/nAuth/src/utils/authSecurity
 * @description Provides shared nAuth utility exports for auth security.
 * @layer utils
 * @owner nAuth
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    buildPayload,
    getJwtSecret,
    getSecurityConfiguration,
    getSignOptions,
    getVerifyOptions
};
