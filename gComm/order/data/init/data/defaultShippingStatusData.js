/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record1: {
        code: "CREATED",
        name: 'Shipment Created',
        description: 'Shipping has been created successfully',
        active: true,
        sequence: '0.0.0'
    },
    record2: {
        code: "ADDRESS_UPDATED",
        name: 'Delivery Address Updated',
        description: 'User delivery address captured successfully',
        active: true,
        sequence: '0.0.0'
    },
    record3: {
        code: "SHIPMENT_READY",
        name: 'Shipment Ready',
        description: 'Shipment is ready to ship to customer',
        active: true,
        sequence: '0.0.0'
    },
    record4: {
        code: "SHIPMENT_COLLECTED",
        name: 'Shipment Collected',
        description: 'Shipment is collected by delivery',
        active: true,
        sequence: '0.0.0'
    },
    record5: {
        code: "DELIVERY_FAILED",
        name: 'Delivery Failed',
        description: 'Shipment delivery failed',
        active: true,
        sequence: '0.0.0'
    },
    record7: {
        code: "DELIVERED",
        name: 'Shipment Delivered',
        description: 'Shipment delivered successfully',
        active: true,
        sequence: '0.0.0'
    },
    record8: {
        code: "RETURN_INITIATED",
        name: 'Return Initiated',
        description: 'Shipment return initiated',
        active: true,
        sequence: '0.0.0'
    },
    record9: {
        code: "SHIPMENT_RETURNED",
        name: 'Shipment Returned',
        description: 'Shipment return',
        active: true,
        sequence: '0.0.0'
    }
};