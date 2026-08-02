/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cronjob/data/core/data/indexer/defaultIndexerData
 * @description Core initializer data for cronjob indexer support records.
 * @layer data
 * @owner cronjob
 * @override Project modules may contribute later indexer data for custom cronjob search behavior.
 */
module.exports = {
    record0: {
        code: "jobLogFullIndexer",
        name: "jobLogFullIndexer",
        active: true,
        finalizeData: false,
        logResult: false,
        incremental: false,
        schema: {
            name: "cronJobLog",
            moduleName: "cronjob",
            searchOptions: {
                pageSize: 100
            },
            options: {
                recursive: true,
            }
        },
        target: {
            indexName: "cronJobLog"
        }
    },

    record1: {
        code: "jobLogIncrementalIndexer",
        name: "jobLogIncrementalIndexer",
        active: true,
        finalizeData: false,
        logResult: false,
        incremental: true,
        schema: {
            name: "cronJobLog",
            moduleName: "cronjob",
            searchOptions: {
                pageSize: 100
            },
            options: {
                recursive: true,
            }
        },
        target: {
            indexName: "cronJobLog"
        }
    }
};
