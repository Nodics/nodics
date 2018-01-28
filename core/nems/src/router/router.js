/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    nems: {
        pushNonSecuredEvent: {
            saveEvent: {
                secured: false,
                key: '/event/push',
                method: 'PUT',
                controller: 'CONTROLLER.EventController.save'
            },
        },
        processEvent: {
            process: {
                secured: true,
                key: '/event/process',
                method: 'GET',
                controller: 'CONTROLLER.EventHandlerController.processEvents'
            }
        }
    }
};