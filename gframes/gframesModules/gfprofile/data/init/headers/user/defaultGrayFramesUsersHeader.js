/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gframes/gframesModules/gfprofile/data/init/headers/user/defaultGrayFramesUsersHeader
 * @description Provides gframesModules initializer or sample data consumed by the import layer.
 * @layer data
 * @owner gframesModules
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    profile: {
        defaultGrayFranesCustomer: {
            options: {
                enabled: true,
                schemaName: 'customer',
                operation: 'saveAll', //saveAll, update and saveOrUpdate
                dataFilePrefix: 'defaultGrayFranesCustomerData'
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
        }
    }
};