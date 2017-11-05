/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    //Database name
    user: {
        //Collection name
        user: {
            super: 'base',
            model: true,
            service: true,
            definition: {
                firstName: "String",
                lastName: "String",
                name: {
                    type: "String",
                    default: 'Nodics Framework'
                }
            }
        },
        person: {
            super: 'user',
            model: true,
            service: true,
            definition: {
                displayName: "String"
            }
        }
    }
}