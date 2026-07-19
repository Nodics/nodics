/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nService/config/properties
 * @description Reserved nService property contribution for shared service runtime defaults.
 * @layer config
 * @owner nService
 * @override Project modules may provide later property contributions for service behavior and diagnostics.
 */
module.exports = {
    serviceCommunication: {
        timeoutMs: 5000,
        retry: {
            maxAttempts: 2,
            baseDelayMs: 50,
            maxDelayMs: 1000,
            jitterRatio: 0.2,
            statuses: [408, 425, 429, 500, 502, 503, 504],
            errorCodes: ['ECONNRESET', 'ECONNREFUSED', 'EPIPE', 'ETIMEDOUT', 'EAI_AGAIN']
        },
        circuitBreaker: {
            enabled: true,
            failureThreshold: 5,
            recoveryTimeoutMs: 30000
        },
        connectionPool: {
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 128,
            maxFreeSockets: 16,
            timeoutMs: 60000
        }
    },
    backofficeRegistration: {
        enabled: true,
        moduleName: 'backoffice',
        leaseTtlMs: 30000,
        heartbeatIntervalMs: 10000,
        retryIntervalMs: 5000,
        requestTimeoutMs: 2000,
        maxModulesPerRegistration: 512,
        healthPath: '/nodics/system/v0/health/ready'
    }
};
