/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    nSearch: {
        indexing: {
            fullIndexing: {
                secured: true,
                key: '/index/full/:indexName/:indexType',
                method: 'POST',
                controller: 'DefaultSearchIndexingController',
                operation: 'fullIndex',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/search/index/full/:indexName/:indexType',
                    body: {
                        reloadSearchSchema: 'true / false'
                    }
                }
            },

            incrementalIndexing: {
                secured: true,
                key: '/index/incremental/:indexName/:indexType',
                method: 'POST',
                controller: 'DefaultSearchIndexingController',
                operation: 'fullIndex',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/search/index/full/:indexName/:indexType',
                    body: {
                        reloadSearchSchema: 'true / false'
                    }
                }
            }
        }
    }
};