/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        workflowCode: 'customerReviewsWorkflow',
        schemaName: 'reviewTest',
        active: true,
        includeProperties: ['name', 'address.city'],
        carrierType: 'FIXED',
        carrierDetail: {
            prefix: 'cr',
            code: 'workflow',
            postFix: 'carrier'
        },
        sourceBuilder: {
            codeStrategy: {
                name: 'GROUPINTIME',
                params: {
                    pattern: 'YYYY_MM_DD_00_MM_SS',
                    delimiter: '_'
                }
            }
        }
    }
};