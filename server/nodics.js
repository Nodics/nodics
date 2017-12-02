/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const nodics = require('../nodics');

module.exports = {
    startNodics: (function() {
        nodics.startNodics({});
    })(),

    init: function() {
        // This is just a placeholder, code written here, is not going to be executed
    }
};