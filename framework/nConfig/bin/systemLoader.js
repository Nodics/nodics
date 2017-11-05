/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const sys = require('./system');

module.exports.init = function() {
    console.log('=> Starting System loader process');
    sys.loadFiles('/bin/system.js', global.SYSTEM);
};