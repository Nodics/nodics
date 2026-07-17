/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nNms/src/utils/statusDefinitions
 * @description Provides shared nNms utility exports for status definitions.
 * @layer utils
 * @owner nNms
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    SUC_RES_00000: {
        code: '200',
        message: 'Successfully processed',
    },
    SUC_RES_00001: {
        code: '200',
        message: 'Successfully granted responsibility',
    },

    ERR_RES_00000: {
        code: '400',
        message: 'Failed due to some internal error',
    },

    ERR_RES_00001: {
        code: '400',
        message: 'Rejected responsibility',
    }
};