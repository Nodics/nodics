/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nems/config/properties
 * @description NEMS properties for event fetch/reset behavior, publish node selection, and module naming.
 * @layer config
 * @owner nems
 * @override Project, environment, server, or node layers may override event processing behavior.
 */
module.exports = {
    eventFetchSize: 100,
    publishEventOnNode: '0',
    eventResetTimeInMinutes: 5 * 60,
    nemsModuleName: 'nems',
};
