/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module complianceCore/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    ERR_CMP_00001: { code: '400', message: 'The compliance context is incomplete.' },
    ERR_CMP_00002: { code: '403', message: 'The compliance operation is not authorized.' },
    ERR_CMP_00003: { code: '403', message: 'Cross-tenant compliance access is prohibited.' },
    ERR_CMP_00004: { code: '403', message: 'Cross-enterprise compliance access is prohibited.' },
    ERR_CMP_00005: { code: '400', message: 'The compliance retention policy is invalid.' }
};
