/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    default: {
        versioned: {
            super: 'super',
            model: false,
            service: false,
            router: false,
            versioned: true,
            definition: {
                versionId: {
                    type: 'int',
                    required: true,
                    description: 'Incremented verison id for staged items'
                }
            },
            indexes: {
                common: {
                    versionId: {
                        name: 'versionId',
                        enabled: true,
                        options: {
                            unique: true
                        }
                    }
                }
            }
        },

        base: {
            super: 'versioned',
        }
    }
};