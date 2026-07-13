/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gCore/workflow/flowCore/src/service/handler/sample/defaultSampleAutoWorkflowService
 * @description Implements workflow default sample auto workflow service business behavior and extension logic.
 * @layer service
 * @owner workflow
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

     * Executes perform head operation behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    performHeadOperation: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve({
                decision: 'AutoOne',
                feedback: {
                    message: 'Testing Single channel process'
                }
            });
        });
    },
    /**
     * Executes perform mix head operation behavior.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    performMixHeadOperation: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve({
                decision: 'mixOne',
                feedback: {
                    message: 'Testing Mix Single channel process'
                }
            });
        });
    },

    /**

     * Executes perform action one behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    performActionOne: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve({
                decision: 'AutoTwo',
                feedback: {
                    message: 'Action one response .............'
                }
            });
        });
    },

    /**

     * Executes perform action two behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    performActionTwo: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve({
                decision: 'SUCCESS',
                feedback: {
                    message: 'Action two response .............SUCCESS'
                }
            });
        });
    },
    /**
     * Executes perform mix action two behavior.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    performMixActionTwo: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve({
                decision: 'SUCCESS',
                feedback: {
                    message: 'Mix Action two response .............SUCCESS'
                }
            });
        });
    }
};