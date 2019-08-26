/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    default: {
        publishable: {
            super: 'super',
            model: false,
            service: false,
            event: false,
            router: false,
            definition: {
                versionId: {
                    type: 'int',
                    required: true,
                    description: 'Incremented verison id for staged items'
                }
            },
            indexes: {
                versionId: {
                    name: 'versionId',
                    enabled: true,
                    composite: true,
                    options: {
                        unique: true
                    }
                }
            }
        },

        base: {
            super: 'publishable',
            indexes: {
                indexCode: {
                    composite: true,
                }
            }
        },
    }
};