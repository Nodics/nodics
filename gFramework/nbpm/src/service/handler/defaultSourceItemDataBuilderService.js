/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nbpm/src/service/handler/defaultSourceItemDataBuilderService
 * @description Implements nbpm default source item data builder service business behavior and extension logic.
 * @layer service
 * @owner nbpm
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**

     * Builds items data.

     *

     * @param {*} schemaModel Method input.

     * @param {*} models Method input.

     * @param {*} workflow Method input.

     * @returns {*} Method result.

     */

    buildItems: function (schemaModel, models, workflow) {
        let items = [];
        models.forEach(model => {
            let itemData = {
                code: model.code,
                refId: model.workflow.refId,
                active: true
            };
            if (workflow.includeProperties && workflow.includeProperties.length > 0) {
                itemData = _.merge(itemData, this.fatchData(model, [].concat(workflow.includeProperties)));
            }
            items.push(itemData);
        });

        return items;
    },

    /**

     * Executes fatch data behavior.

     *

     * @param {*} model Method input.

     * @param {*} properties Method input.

     * @param {*} itemData Method input.

     * @returns {*} Method result.

     */

    fatchData: function (model, properties = [], itemData = {}) {
        if (properties.length > 0) {
            let property = properties.shift();
            if (property.indexOf(".") > 0) {
                let firstProp = property.substring(0, property.indexOf(".", 1));
                let restProps = property.substring(property.indexOf(".", 1) + 1, property.length);
                itemData[firstProp] = _.merge(itemData[firstProp] || {}, this.fatchData(model[firstProp], [restProps]));
            } else {
                itemData[property] = model[property];
            }
            this.fatchData(model, properties, itemData);
        }
        return itemData;
    }
};