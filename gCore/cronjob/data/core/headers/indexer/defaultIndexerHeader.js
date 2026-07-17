/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/data/core/headers/indexer/defaultIndexerHeader
 * @description Import header for saving cronjob indexer support records.
 * @layer data
 * @owner cronjob
 * @override Project modules may add later headers for custom cronjob indexer data.
 */
module.exports = {
    dataConsumer: {
        defaultIndexerData: {
            options: {
                enabled: true,
                schemaName: 'indexer',
                operation: 'saveAll', //save, update and saveOrUpdate
                dataFilePrefix: 'defaultIndexerData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
