/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    record0: {
        code: "defaultProductCatalog",
        subCatalogs: ['inProductCatalog', 'uaeProductCatalog', 'deProductCatalog']
    },
    record1: {
        code: "defaultContentCatalog",
        subCatalogs: ['inContentCatalog', 'uaeContentCatalog', 'deContentCatalog']
    },
    record2: {
        code: "inProductCatalog",
        name: "inProductCatalog",
        active: true
    },
    record3: {
        code: "uaeProductCatalog",
        name: "uaeProductCatalog",
        active: true
    },
    record4: {
        code: "deProductCatalog",
        name: "deProductCatalog",
        active: true
    },
    record5: {
        code: "inContentCatalog",
        name: "inContentCatalog",
        active: true
    },
    record6: {
        code: "uaeContentCatalog",
        name: "uaeContentCatalog",
        active: true
    },
    record7: {
        code: "deContentCatalog",
        name: "deContentCatalog",
        active: true
    }
};