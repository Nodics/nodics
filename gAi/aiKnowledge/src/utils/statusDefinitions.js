/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiKnowledge/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    SUC_AIK_00000: { code: '200', message: 'AI Knowledge retrieval completed' },
    SUC_AIK_00001: { code: '200', message: 'AI Knowledge ingestion completed' },
    SUC_AIK_00002: { code: '200', message: 'AI Knowledge candidate activated' },
    SUC_AIK_00003: { code: '200', message: 'AI Knowledge corpus rolled back' },
    SUC_AIK_00004: { code: '200', message: 'AI Knowledge readiness returned' },
    SUC_AIK_00005: { code: '200', message: 'AI Knowledge ingestion runs returned' },
    SUC_AIK_00006: { code: '200', message: 'AI Knowledge metrics returned' },
    ERR_AIK_00000: { code: '503', message: 'AI Knowledge is disabled' },
    ERR_AIK_00001: { code: '404', message: 'AI Knowledge corpus has no active version' },
    ERR_AIK_00002: { code: '409', message: 'AI Knowledge activation revision conflict' },
    ERR_AIK_00003: { code: '503', message: 'AI Knowledge search is unavailable' },
    ERR_AIK_00004: { code: '400', message: 'AI Knowledge request is invalid' }
};
