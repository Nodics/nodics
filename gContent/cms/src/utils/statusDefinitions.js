/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gContent/cms/src/utils/statusDefinitions.js
 * @description Provides shared cms status and error definition exports.
 * @layer utils
 * @owner cms
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    ERR_CMS_00080: { code: '401', message: 'CMS Site reference lookup requires service identity' },
    ERR_CMS_00081: { code: '400', message: 'CMS Site reference input is invalid' }
};
