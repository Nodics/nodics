/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nPublish/src/utils/statusDefinitions.js
 * @description Provides shared publish status and error definition exports.
 * @layer utils
 * @owner publish
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    ERR_PUB_00000: { code: '400', message: 'Invalid publication request' },
    ERR_PUB_00001: { code: '503', message: 'Publication provider is unavailable' },
    ERR_PUB_00002: { code: '400', message: 'Publication domain adapter is unavailable' },
    ERR_PUB_00003: { code: '409', message: 'Publication identity conflict' },
    ERR_PUB_00004: { code: '409', message: 'Publication revision conflict' },
    ERR_PUB_00005: { code: '409', message: 'Invalid publication state transition' },
    ERR_PUB_00006: { code: '422', message: 'Publication validation failed' }
};
