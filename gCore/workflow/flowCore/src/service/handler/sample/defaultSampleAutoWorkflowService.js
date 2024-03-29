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