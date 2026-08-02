/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nCommon/config/properties
 * @description Baseline shared properties for error serialization, external data staging, and default error-code resolution.
 * @layer config
 * @owner nCommon
 * @override Later modules may override these values through layered configuration; production deployments should control stack exposure and external data locations per environment.
 * @property {boolean} returnErrorStack Controls stack inclusion in serialized errors.
 * @property {string} externalDataLocation Server-relative import/export data root.
 * @property {Object<string,string>} defaultErrorCodes Fallback status codes by error type.
 */
module.exports = {
    returnErrorStack: false,
    externalDataLocation: 'data',

    defaultErrorCodes: {
        NodicsError: 'ERR_SYS_00000'
    }
};
