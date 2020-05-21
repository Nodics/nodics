/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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

    generateCarrierCode: function (options) {
        let timeProps = [(new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate(), (new Date()).getHours(), (new Date()).getMinutes(), (new Date()).getSeconds()];
        if (!options.params || !options.params.pattern) {
            throw new CLASSES.WorkflowError('Invalid pattern defined in configuration');
        } else if (timeProps.length != options.params.pattern.split('_').length) {
            throw new CLASSES.WorkflowError('Invalid pattern should be: "YYYY_MM_DD_HH_MM_SS" and found: ' + options.params.pattern);
        } else {
            let timeData = [];
            options.params.pattern.split('_').forEach((item, index) => {
                let val = parseInt(item);
                if (isNaN(val)) {
                    timeData.push(eval(values[index]));
                } else {
                    timeData.push(val);
                }
            });
            let carrierCode = timeData.join(options.params.pattern.delimiter || '_');
            if (options.workflow.carrierDetail && options.workflow.carrierDetail.postFix) {
                carrierCode = options.workflow.carrierDetail.postFix.toUpperCaseFirstChar() + '_' + carrierCode;
            }
            if (options.workflow.carrierDetail && options.workflow.carrierDetail.code) {
                carrierCode = options.workflow.carrierDetail.code + '_' + carrierCode;
            } else {
                carrierCode = options.model.code + '_' + carrierCode;
            }

            if (options.workflow.carrierDetail && options.workflow.carrierDetail.prefix) {
                carrierCode = options.workflow.carrierDetail.prefix + '_' + carrierCode.toUpperCaseFirstChar();
            }
            return carrierCode;
        }
    }
};