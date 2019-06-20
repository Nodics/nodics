/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
            options: {
                recursive: true,
                pageSize: 100
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
            options: {
                recursive: true,
                pageSize: 100
            }
        },
        target: {
            indexName: "cronJobLog"
        }
    }
};