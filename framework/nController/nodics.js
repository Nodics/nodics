/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const controller = require('./bin/controllerGenerator');

module.exports = {
    init: function() {

    },
    loadController: function() {
        console.log('=> Starting Controller Generation process');
        controller.init();
    }
};