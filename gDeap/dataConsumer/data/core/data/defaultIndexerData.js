/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: "internalDataFullIndexer",
        name: "internalDataFullIndexer",
        active: true,
        finalizeData: false,
        logResult: false,
        incremental: false,
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
        code: "internalDataIncrementalIndexer",
        name: "internalDataIncrementalIndexer",
        active: true,
        finalizeData: false,
        logResult: false,
        incremental: true,
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
    },
    record2: {
        code: "externalDataFullIndexer",
        name: "externalDataFullIndexer",
        active: true,
        finalizeData: false,
        logResult: false,
        incremental: false,
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
    record3: {
        code: "internalDataIncrementalIndexer",
        name: "internalDataIncrementalIndexer",
        active: true,
        finalizeData: false,
        logResult: false,
        incremental: true,
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