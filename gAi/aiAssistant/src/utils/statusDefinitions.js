/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    SUC_AIA_00000: { code: '200', message: 'AI Assistant conversation created' },
    SUC_AIA_00001: { code: '200', message: 'AI Assistant conversations returned' },
    SUC_AIA_00002: { code: '200', message: 'AI Assistant conversation returned' },
    SUC_AIA_00003: { code: '202', message: 'AI Assistant turn accepted' },
    SUC_AIA_00004: { code: '200', message: 'AI Assistant turn returned' },
    SUC_AIA_00005: { code: '200', message: 'AI Assistant turn events returned' },
    SUC_AIA_00006: { code: '200', message: 'AI Assistant turn cancelled' },
    SUC_AIA_00007: { code: '200', message: 'AI Assistant abandoned turns reconciled' },
    SUC_AIA_00008: { code: '200', message: 'AI Assistant execution diagnostics returned' },
    SUC_AIA_00009: { code: '200', message: 'AI Assistant confirmation created' },
    SUC_AIA_00010: { code: '200', message: 'AI Assistant confirmation approved' },
    SUC_AIA_00011: { code: '200', message: 'AI Assistant confirmed operation accepted' },
    SUC_AIA_00012: { code: '200', message: 'AI Assistant conversation history returned' },
    ERR_AIA_00000: { code: '403', message: 'AI Assistant requires an authenticated employee identity' },
    ERR_AIA_00001: { code: '404', message: 'AI Assistant resource was not found' },
    ERR_AIA_00002: { code: '409', message: 'AI Assistant turn state does not allow cancellation' },
    ERR_AIA_00003: { code: '404', message: 'Enabled AI Assistant definition was not found' },
    ERR_AIA_00004: { code: '400', message: 'AI Assistant replay cursor is invalid' },
    ERR_AIA_00005: { code: '410', message: 'AI Assistant replay window has expired' },
    ERR_AIA_00006: { code: '400', message: 'AI Assistant mutation is not approved' },
    ERR_AIA_00007: { code: '409', message: 'AI Assistant confirmation is stale or conflicts with current state' },
    ERR_AIA_00008: { code: '410', message: 'AI Assistant confirmation has expired' }
};
