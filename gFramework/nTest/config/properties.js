/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTest/config/properties
 * @description Default test execution settings for unit tests, Nodics tests, and layered test discovery.
 * @layer config
 * @owner nTest
 * @override Project, environment, server, or node layers may override test activation and discovery paths.
 */
module.exports = {
    test: {
        enabled: false,
        layeredDiscovery: {
            enabled: true,
            paths: []
        },
        uTest: {
            enabled: true,
            runOnStartup: true
        },
        nTest: {
            enabled: true,
            runOnStartup: true
        }
    }
};
