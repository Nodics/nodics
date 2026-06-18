/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
