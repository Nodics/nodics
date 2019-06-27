/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    cache: {
        default: {
            channels: {
                search: {
                    enabled: true,
                    fallback: true,
                    engine: 'local'
                }
            }
        }
    },
    search: {
        requestTimeout: 1000,
        defaultPropertyWeight: 0,
        defaultPropertySequence: 0,
        defaultDoSaveOperation: 'doSave',
        eventOnRefresh: true,
        default: {
            options: {
                enabled: false, //if false, system will not configure any search related functionalities
                fallback: true, // If true and search query return blank result, same query will be performed to Database
                engine: 'elastic', //Engine could be like elastic, solr, googleCommerce, endeca
            }
        }
    }
};