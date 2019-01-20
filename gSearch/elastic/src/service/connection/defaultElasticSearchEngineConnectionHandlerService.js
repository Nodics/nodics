/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

*/

const _ = require('lodash');
let elasticsearch = require('elasticsearch');

module.exports = {

    /**
     * This function is used to setup your service just after service is loaded.
     */
    init: function () {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to setup your service just before routers are getting activated.
     */
    postInit: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.loadRawSearchModelDefinition();
            resolve(true);
        });
    },

    loadRawSearchModelDefinition: function () {
        let modelDefinition = {};
        SYSTEM.loadFiles('/src/schemas/elasticSearchModel.js', modelDefinition);
        SERVICE.DefaultSearchConfigurationService.addRawSearchModelDefinition('elastic', modelDefinition);
    },

    createSearchConnection: function (searchOptions) {
        return new Promise((resolve, reject) => {
            try {
                let defaultSearchConfig = CONFIG.get('search', searchOptions.tntCode);
                let searchEngine = new CLASSES.SearchEngine();
                searchEngine.setOptions(searchOptions.options);
                searchEngine.setConnectionOptions(searchOptions.connection);
                let client = new elasticsearch.Client(searchOptions.connection);
                client.ping({
                    requestTimeout: defaultSearchConfig.requestTimeout
                }, function (error) {
                    if (error) {
                        reject({
                            success: false,
                            code: 'ERR_SRCH_00001',
                            msg: error
                        });
                    } else {
                        searchEngine.setConnection(client);
                        searchEngine.setActive(true);
                        resolve(searchEngine);
                    }
                });
            } catch (err) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: err
                });
            }
        });
    }
};