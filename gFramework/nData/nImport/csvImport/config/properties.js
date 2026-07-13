/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nImport/csvImport/config/properties
 * @description Defines default nData configuration used during module startup and layering.
 * @layer config
 * @owner nData
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    data: {
        csvTypeParserOptions: {
            output: "json",
            trim: true,
            ignoreEmpty: true
        },
        fileTypeProcess: {
            csv: 'csvFileDataInitializerPipeline'
        }
    }
};