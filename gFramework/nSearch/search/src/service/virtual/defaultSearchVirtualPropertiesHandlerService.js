/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    populateVirtualProperties: function (virtualProperties, documents) {
        if (documents instanceof Array) {
            documents.forEach(document => {
                this.populateProperties(virtualProperties, document);
            });
        } else {
            this.populateProperties(virtualProperties, documents);
        }
    },
    populateProperties: function (virtualProperties, document) {
        let _self = this;
        _.each(virtualProperties, (method, property) => {
            _self.populateProperty(property, method, document);
        });
    },

    populateProperty: function (property, method, document) {
        let _self = this;
        if (method instanceof Object) {
            let doc = document[property];
            if (!UTILS.isBlank(doc)) {
                _.each(method, (value, prop) => {
                    _self.populateProperty(prop, value, doc);
                });
            }
        } else {
            this.populate(property, method, document);
        }
    },

    populate: function (property, method, document) {
        let serviceName = method.substring(0, method.lastIndexOf('.'));
        let operation = method.substring(method.lastIndexOf('.') + 1, method.length);
        document[property] = SERVICE[serviceName][operation](document);
    }
};