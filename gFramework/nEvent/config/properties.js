/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nEvent/config/properties
 * @description Defines default nEvent configuration used during module startup and layering.
 * @layer config
 * @owner nEvent
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    event: {
        processAsSyncHandler: true,
        publishAllActive: true,
        ignoreIfNoLister: true
    },
    defaultErrorCodes: {
        EventError: 'ERR_EVNT_00000'
    }
};