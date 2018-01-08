/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    finalizeConfig: function() {
        /*let event = {
            name: "himkar"
        };
        NODICS.getModules().user.eventService.emit('testMe', event, function(error, success) {
            console.log(error, '  :  ----------------------------------   :  ', success);
        });
*/
        return '----Finalizing configuration';
    },

    finalizeConfig1: function() {
        return '----Finalizing configuration 1';
    },

    finalizeConfig2: function() {
        return '----Finalizing configuration 2';
    }
};