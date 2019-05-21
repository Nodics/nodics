/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: "InternalDataIndexer",
        name: "InternalDataIndexer",
        active: true,
        finalizeData: false,
        logResult: false,
        schema: {
            name: "internalData",
            moduleName: "dataConsumer",
            options: {
                recursive: true,
                pageSize: 100
            }
        },
        target: {
            indexName: "internalData"
        }
    },
    record1: {
        code: "ExternalDataIndexer",
        name: "ExternalDataIndexer",
        active: true,
        finalizeData: false,
        logResult: false,
        schema: {
            name: "externalData",
            moduleName: "dataConsumer",
            options: {
                recursive: true,
                pageSize: 100
            }
        },
        target: {
            indexName: "externalData"
        }
    }
};