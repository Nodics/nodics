/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    default: {
        base: {
            super: 'none',
            model: false,
            service: false,
            event: false,
            router: false,
            definition: {
                enterpriseCode: {
                    type: 'String',
                    required: true
                },
                created: {
                    type: 'Date',
                    default: new Date() //new Date(+new Date() + 7 * 24 * 60 * 60 * 1000)
                },
                updated: {
                    type: 'Date',
                    default: new Date() //new Date(+new Date() + 7 * 24 * 60 * 60 * 1000)
                }
            }
        }
    }
};