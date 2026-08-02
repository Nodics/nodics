/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gDeap/dataConsumer/data/core/data/defaultIndexerData
 * @description Provides dataConsumer initializer or sample data consumed by the import layer.
 * @layer data
 * @owner dataConsumer
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
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
            },
            searchOptions: {
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
            name: "internalData",
            moduleName: "dataConsumer",
            options: {
                recursive: true,
            },
            searchOptions: {
                pageSize: 100
            }
        },
        target: {
            indexName: "internalData"
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
            name: "externalData",
            moduleName: "dataConsumer",
            options: {
                recursive: true,
            },
            searchOptions: {
                pageSize: 100
            }
        },
        target: {
            indexName: "externalData"
        }
    },
    record3: {
        code: "externalDataIncrementalIndexer",
        name: "externalDataIncrementalIndexer",
        active: true,
        finalizeData: false,
        logResult: false,
        incremental: true,
        schema: {
            name: "externalData",
            moduleName: "dataConsumer",
            options: {
                recursive: true,
            },
            searchOptions: {
                pageSize: 100
            }
        },
        target: {
            indexName: "externalData"
        }
    }
};