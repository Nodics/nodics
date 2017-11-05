/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    //Created this class to test if cronJob run process works fine
    options: {
        isNew: true
    },

    runJob: function(definition) {
        console.log('CronJos Started................1111 ');
    },

    stopJob: function(definition) {
        console.log('CronJos Started................ stopJob');
    }
}