/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nCommon/config/postscripts
 * @description Default nCommon post-start script hooks retained for layered startup compatibility. They return diagnostic labels and do not mutate runtime state.
 * @layer config
 * @owner nCommon
 * @override Later modules may add or override named post-scripts through the active module hierarchy.
 */
module.exports = {
    /** @returns {string} Primary finalization diagnostic label. */
    finalizeConfig: function() {
        return '----Finalizing configuration';
    },

    /** @returns {string} Secondary finalization diagnostic label. */
    finalizeConfig1: function() {
        return '----Finalizing configuration 1';
    },

    /** @returns {string} Tertiary finalization diagnostic label. */
    finalizeConfig2: function() {
        return '----Finalizing configuration 2';
    }
};
