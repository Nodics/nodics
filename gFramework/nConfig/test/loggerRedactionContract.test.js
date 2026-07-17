/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nConfig/test/loggerRedactionContract
 * @description Verifies that central logger serialization redacts sensitive
 * tokens, credentials, and secret-bearing fields before logs reach transports.
 * @layer test
 * @owner nConfig
 * @override Project modules may add stricter redaction keys through layered
 * `log.redaction` configuration while preserving the platform no-secret-log
 * contract.
 */
const assert = require('assert');

const loggerService = require('../src/service/DefaultLoggerService');

global.CONFIG = {
    get: function (key) {
        if (key === 'log') {
            return {
                redaction: {
                    enabled: true,
                    mask: '[MASKED]',
                    sensitiveKeys: ['authorization', 'token', 'password', 'apiKey', 'secret']
                }
            };
        }
        return undefined;
    }
};

let circular = {
    user: 'apiAdmin',
    password: 'plain-password',
    profile: {
        accessToken: 'access-token-value',
        apiKey: 'client-generated-key-value'
    },
    headers: {
        Authorization: 'Bearer real.jwt.token',
        normal: 'visible'
    },
    uri: 'mongodb://admin:secret@localhost:27017/nodics'
};
circular.self = circular;

let formatted = loggerService.formatObject(circular);

assert(!formatted.includes('plain-password'), 'password value must not be logged');
assert(!formatted.includes('access-token-value'), 'token value must not be logged');
assert(!formatted.includes('client-generated-key-value'), 'API key value must not be logged');
assert(!formatted.includes('real.jwt.token'), 'bearer token must not be logged');
assert(!formatted.includes('admin:secret@'), 'connection URI credentials must not be logged');
assert(formatted.includes('[MASKED]'), 'configured redaction mask should be used');
assert(formatted.includes('[Circular]'), 'circular structures should remain serializable');
assert(formatted.includes('visible'), 'non-sensitive values should remain visible');

let message = loggerService.formatObject('Authorization: Bearer raw-token password=secret-value apiKey=api-key-value');

assert(!message.includes('raw-token'), 'authorization token in string message must be redacted');
assert(!message.includes('secret-value'), 'password in string message must be redacted');
assert(!message.includes('api-key-value'), 'API key in string message must be redacted');
assert(message.includes('[MASKED]'), 'string redaction should use configured mask');

let elasticLog = loggerService.createElasticLogTransformer()({
    level: 'info',
    message: 'Authorization: Bearer elastic-token',
    meta: {
        request: {
            password: 'elastic-password',
            apiKey: 'elastic-api-key'
        }
    }
});

assert(!JSON.stringify(elasticLog).includes('elastic-token'), 'Elasticsearch message must be redacted');
assert(!JSON.stringify(elasticLog).includes('elastic-password'), 'Elasticsearch metadata password must be redacted');
assert(!JSON.stringify(elasticLog).includes('elastic-api-key'), 'Elasticsearch metadata API key must be redacted');

delete global.CONFIG;
