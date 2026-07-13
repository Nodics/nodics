/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module config/config/postscripts
 * @description Default nConfig post-start script hooks retained as layered startup extension points. They currently return diagnostic completion labels and do not mutate runtime state.
 * @layer config
 * @owner nConfig
 * @override Project, environment, server, or node modules may add or override post-script functions through the active module hierarchy without changing nConfig.
 */
module.exports = {
    /**
     * Returns the primary configuration-finalization diagnostic label.
     *
     * @returns {string} Finalization label.
     */
    finalizeConfig: function() {
        return '----Finalizing configuration';
    },

    /**
     * Returns the secondary configuration-finalization diagnostic label.
     *
     * @returns {string} Finalization label.
     */
    finalizeConfig1: function() {
        return '----Finalizing configuration 1';
    },

    /**
     * Returns the tertiary configuration-finalization diagnostic label.
     *
     * @returns {string} Finalization label.
     */
    finalizeConfig2: function() {
        return '----Finalizing configuration 2';
    }
};
