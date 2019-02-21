/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    data: {
        csvTypeParserOptions: {
            output: "json"
        },

        excelTypeParserOptions: {
            sheet: 1,
            isColOriented: false,
            omitEmptyFields: false,
            convertTextToNumber: true
        },

        fileTypeProcess: {
            js: 'jsFileDataInitializerPipeline',
            json: 'jsonFileDataInitializerPipeline',
            csv: 'csvFileDataInitializerPipeline',
            xls: 'excelFileDataInitializerPipeline',
            xlsb: 'excelFileDataInitializerPipeline',
            xlsm: 'excelFileDataInitializerPipeline',
            xlsx: 'excelFileDataInitializerPipeline'
        }
    }
};