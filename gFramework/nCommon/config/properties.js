/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
    returnErrorStack: true,
    externalDataLocation: NODICS.getServerPath() + '/data',

    defaultErrorCodes: {
        NodicsError: 'ERR_SYS_00000'
    }
};
