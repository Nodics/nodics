/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module fulfillment/interceptors/interceptors @description Fulfillment validation and lifecycle interceptors. @layer interceptor @owner fulfillment */
module.exports = {
    fulfillmentCarrierProviderPreSavePolicy: {
        type: 'schema',
        item: 'fulfillmentCarrierProvider',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultFulfillmentPolicyService.prepareCarrierProvider',
    },
    fulfillmentConsignmentPreSavePolicy: {
        type: 'schema',
        item: 'fulfillmentConsignment',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultFulfillmentPolicyService.prepareConsignment',
    },
    fulfillmentShipmentPreSavePolicy: {
        type: 'schema',
        item: 'fulfillmentShipment',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultFulfillmentPolicyService.prepareShipment',
    },
    fulfillmentWarehouseTaskPreSavePolicy: {
        type: 'schema',
        item: 'fulfillmentWarehouseTask',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultFulfillmentPolicyService.prepareWarehouseTask',
    },
    fulfillmentTrackingEventPreSavePolicy: {
        type: 'schema',
        item: 'fulfillmentTrackingEvent',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultFulfillmentPolicyService.prepareTrackingEvent',
    },
    fulfillmentReturnRequestPreSavePolicy: {
        type: 'schema',
        item: 'fulfillmentReturnRequest',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultFulfillmentPolicyService.prepareReturnRequest',
    },
    fulfillmentConsignmentPreRemovePolicy: {
        type: 'schema',
        item: 'fulfillmentConsignment',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultFulfillmentPolicyService.rejectHardDelete',
    },
    fulfillmentCarrierProviderPreRemovePolicy: {
        type: 'schema',
        item: 'fulfillmentCarrierProvider',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultFulfillmentPolicyService.rejectHardDelete',
    },
    fulfillmentWarehouseTaskPreRemovePolicy: {
        type: 'schema',
        item: 'fulfillmentWarehouseTask',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultFulfillmentPolicyService.rejectHardDelete',
    },
    fulfillmentTrackingEventPreRemovePolicy: {
        type: 'schema',
        item: 'fulfillmentTrackingEvent',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultFulfillmentPolicyService.rejectHardDelete',
    },
    fulfillmentReturnRequestPreRemovePolicy: {
        type: 'schema',
        item: 'fulfillmentReturnRequest',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultFulfillmentPolicyService.rejectHardDelete',
    },
};
