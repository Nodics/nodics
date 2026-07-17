/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/data/init/headers/user/defaultCmsEmployeeDataHeader
 * @description Initial-data import header for default CMS employee records.
 * @layer data
 * @owner cms
 * @override Project modules may supply later headers to change CMS employee import behavior.
 */
module.exports = {
    profile: {
        defaultCmsEmployee: {
            options: {
                enabled: true,
                schemaName: 'employee',
                operation: 'saveAll', //saveAll, update and saveOrUpdate
                dataFilePrefix: 'defaultCmsEmployeeData'
            },
            query: {
                code: '$code',
                loginId: '$loginId',
            },
            macros: {
                addresses: {
                    options: {
                        model: 'address',
                        returnProperty: 'code'
                    },
                    rule: {
                        code: {
                            type: 'string',
                            index: 0
                        }
                    }
                },
                contacts: {
                    options: {
                        model: 'contact',
                        returnProperty: 'code'
                    },
                    rule: {
                        code: {
                            type: 'string',
                            index: 0
                        }
                    }
                }
            }
        },
    }
};
