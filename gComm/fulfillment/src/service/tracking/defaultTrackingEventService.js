/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module fulfillment/service/tracking/DefaultTrackingEventService
 * @description Ingests safe normalized carrier tracking events and projects them onto Fulfillment shipment lifecycle.
 * @layer service
 * @owner fulfillment
 * @override Customer modules may replace carrier event normalization and lifecycle mapping without storing raw carrier payloads.
 */
module.exports = {
    /** Initializes tracking event ingestion. */
    init: function () { return Promise.resolve(true); },
    /** Completes tracking event ingestion startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered fulfillment policy. */
    config: function () { return ((CONFIG.get('fulfillment') || {}).fulfillmentPolicy) || {}; },
    /** Creates a stable tracking event error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_FUL_00006');
        let error = new Error(message);
        error.code = 'ERR_FUL_00006';
        return error;
    },
    /** Normalizes generated-service responses and preloaded arrays. */
    items: function (value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (Array.isArray(value.result)) return value.result;
        if (Array.isArray(value.items)) return value.items;
        return [value];
    },
    /** Loads the shipment receiving the tracking event. */
    loadShipment: async function (request) {
        if (request.shipment) return request.shipment;
        if (!SERVICE.DefaultFulfillmentShipmentLifecycleService || typeof SERVICE.DefaultFulfillmentShipmentLifecycleService.loadShipment !== 'function') {
            throw this.error('Fulfillment shipment lifecycle service is unavailable');
        }
        let shipment = await SERVICE.DefaultFulfillmentShipmentLifecycleService.loadShipment(request);
        if (!shipment) throw this.error('Tracking event shipment was not found');
        return shipment;
    },
    /** Loads an existing tracking event by event or idempotency identity. */
    loadEvent: async function (request) {
        if (request.event) return request.event;
        if (!SERVICE.DefaultFulfillmentTrackingEventService || typeof SERVICE.DefaultFulfillmentTrackingEventService.get !== 'function') {
            throw this.error('Fulfillment tracking event generated service is unavailable');
        }
        let query = request.eventCode ? { eventCode: request.eventCode } :
            request.idempotencyKey ? { idempotencyKey: request.idempotencyKey } : undefined;
        if (!query) throw this.error('Tracking event requires eventCode or idempotencyKey');
        let response = await SERVICE.DefaultFulfillmentTrackingEventService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: query,
            searchOptions: { limit: 2 },
        });
        let events = this.items(response);
        if (events.length > 1) throw this.error('Tracking event resolved duplicate records');
        return events[0];
    },
    /** Persists tracking event evidence through the generated Fulfillment service. */
    saveEvent: async function (request, event) {
        if (!SERVICE.DefaultFulfillmentTrackingEventService || typeof SERVICE.DefaultFulfillmentTrackingEventService.save !== 'function') {
            throw this.error('Fulfillment tracking event generated service is unavailable');
        }
        let response = await SERVICE.DefaultFulfillmentTrackingEventService.save({
            tenant: request.tenant,
            authData: request.authData,
            model: event,
        });
        return this.items(response)[0] || response.result || event;
    },
    /** Validates common tracking ingestion authority and safety. */
    validateRequest: function (request) {
        if (!request || !request.tenant || !request.authData || !request.shipmentCode || !request.normalizedEventType) {
            throw this.error('Tracking event requires tenant, auth, shipmentCode, and normalizedEventType');
        }
        if (SERVICE.DefaultFulfillmentPolicyService && typeof SERVICE.DefaultFulfillmentPolicyService.assertSafe === 'function') {
            SERVICE.DefaultFulfillmentPolicyService.assertSafe(request);
        }
    },
    /** Applies configured shipment lifecycle status projection from one event. */
    applyShipmentProjection: async function (request, shipment, event) {
        let trackingPolicy = this.config().trackingPolicy || {};
        if (trackingPolicy.applyShipmentStatusFromTrackingEvents === false || !event.appliedShipmentStatus) {
            return { event: Object.assign({}, event, { status: 'IGNORED' }) };
        }
        if (!SERVICE.DefaultFulfillmentShipmentLifecycleService) {
            throw this.error('Fulfillment shipment lifecycle service is unavailable');
        }
        let lifecycleRequest = Object.assign({}, request, {
            shipmentCode: shipment.shipmentCode,
            consignmentCode: shipment.consignmentCode,
        });
        let shipmentResult;
        if (event.appliedShipmentStatus === 'DELIVERED') {
            shipmentResult = await SERVICE.DefaultFulfillmentShipmentLifecycleService.deliver(lifecycleRequest);
            shipmentResult = shipmentResult.shipment || shipmentResult;
        } else {
            shipmentResult = await SERVICE.DefaultFulfillmentShipmentLifecycleService.transitionShipment(lifecycleRequest, event.appliedShipmentStatus, {
                failureCode: event.normalizedEventType === 'FAILED' || event.normalizedEventType === 'EXCEPTION' ? event.providerEventCode : undefined,
                failureMessage: event.normalizedEventType === 'FAILED' || event.normalizedEventType === 'EXCEPTION' ? event.message : undefined,
            });
        }
        return {
            event: Object.assign({}, event, { status: 'APPLIED' }),
            shipment: shipmentResult,
        };
    },
    /** Ingests a safe normalized carrier tracking event idempotently. */
    ingestEvent: async function (request) {
        this.validateRequest(request);
        let shipment = await this.loadShipment(request);
        if (!SERVICE.DefaultFulfillmentPolicyService || typeof SERVICE.DefaultFulfillmentPolicyService.buildTrackingEventDraft !== 'function') {
            throw this.error('Fulfillment policy service is unavailable');
        }
        let draft = SERVICE.DefaultFulfillmentPolicyService.buildTrackingEventDraft(request, shipment);
        let existing = await this.loadEvent(Object.assign({}, request, { idempotencyKey: draft.idempotencyKey }));
        if (existing) return { event: Object.assign({ idempotent: true }, existing), shipment: shipment };
        let saved = await this.saveEvent(request, draft);
        let projection = await this.applyShipmentProjection(request, shipment, saved);
        let event = await this.saveEvent(request, projection.event);
        return {
            event: event,
            shipment: projection.shipment || shipment,
        };
    },
};
