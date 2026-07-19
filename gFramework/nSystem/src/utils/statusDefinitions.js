/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nSystem/src/utils/statusDefinitions
 * @description Provides shared nSystem utility exports for status definitions.
 * @layer utils
 * @owner nSystem
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    SUC_SYS_HEALTH_LIVE: {
        code: '200',
        message: 'Runtime process is live'
    },
    SUC_SYS_HEALTH_READY: {
        code: '200',
        message: 'Runtime is ready to receive traffic'
    },
    SUC_SYS_HEALTH_NOT_READY: {
        code: '503',
        message: 'Runtime is not ready to receive traffic'
    },
    SUC_SYS_00001: {
        code: '200',
        message: 'OpenAPI contract resolved successfully'
    },
    SUC_SYS_00002: {
        code: '200',
        message: 'Swagger UI resolved successfully'
    },
    SUC_SYS_00003: {
        code: '200',
        message: 'Swagger UI asset resolved successfully'
    }
};
