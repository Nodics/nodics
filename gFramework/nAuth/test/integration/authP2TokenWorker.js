/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nAuth/test/integration/AuthP2TokenWorker
 * @description Represents a separate modular node that verifies a service JWT
 * and enforces the tenant and permission expected by its request context.
 * @layer test
 * @owner nAuth
 * @override Project topology tests may replace this worker with real server
 * processes while retaining the same claim assertions.
 */
const jwt = require('jsonwebtoken');

try {
    let input = JSON.parse(Buffer.from(process.argv[2], 'base64url').toString('utf8'));
    let payload = jwt.verify(input.token, input.secret, {
        algorithms: ['HS256'], issuer: input.issuer, audience: input.audience
    });
    if (payload.tenant !== input.requestTenant) throw new Error('TOKEN_TENANT_MISMATCH');
    if (!(payload.permissions || []).includes(input.permission)) throw new Error('TOKEN_PERMISSION_MISSING');
    if (String(payload.authVersion) !== String(input.authVersion)) throw new Error('TOKEN_SECURITY_STAMP_MISMATCH');
    process.stdout.write(JSON.stringify({ accepted: true, tenant: payload.tenant, serviceId: payload.serviceId }));
} catch (error) {
    process.stderr.write(error.message);
    process.exit(1);
}
