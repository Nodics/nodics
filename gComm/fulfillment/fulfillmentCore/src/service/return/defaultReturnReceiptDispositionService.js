/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module fulfillment/service/return/DefaultReturnReceiptDispositionService @description Coordinates the Fulfillment receipt technical pipeline and delegates stock effects to Inventory. @layer service @owner fulfillment */
module.exports = {
    /**
     * Initializes the module artifact within the fulfillmentCore-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the config operation within the fulfillmentCore-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    config: function () { return (((CONFIG.get('fulfillment') || {}).fulfillmentPolicy || {}).returnReceiptDisposition) || {}; },
    /**
     * Executes the error operation within the fulfillmentCore-owned layered contract.
     *
     * @param {*} message Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    error: function (message) { let error = new Error(message); error.code = 'ERR_FUL_00008'; return error; },
    /**
     * Executes the input operation within the fulfillmentCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    input: function (request) { return request.returnReceiptDisposition || request.body || {}; },
    /**
     * Validates receipt within the fulfillmentCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validateReceipt: async function (request, response, process) { try { let input = this.input(request); if (!request.tenant || !request.authData || request.authData.tokenType !== 'service' || !input.returnCode || !input.receivedQuantity || !/^(?!0(?:\.0+)?$)(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(input.receivedQuantity) || !input.dispositionCode || !input.inspectionResult) throw this.error('Return receipt requires internal identity, exact positive quantity, disposition, and inspection evidence'); response.returnInput = input; response.returnRecord = await SERVICE.DefaultReturnRequestService.loadReturn(Object.assign({}, request, { returnCode: input.returnCode })); if (!response.returnRecord) throw this.error('Return receipt was not found'); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    /**
     * Executes the receive return operation within the fulfillmentCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    receiveReturn: async function (request, response, process) { try { response.receivedReturn = response.returnRecord.status === 'RECEIVED' || response.returnRecord.status === 'INSPECTED' ? response.returnRecord : await SERVICE.DefaultReturnRequestService.receiveReturn(Object.assign({}, request, response.returnInput)); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    /**
     * Executes the inspect return operation within the fulfillmentCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    inspectReturn: async function (request, response, process) { try { response.inspectedReturn = response.receivedReturn.status === 'INSPECTED' ? response.receivedReturn : await SERVICE.DefaultReturnRequestService.inspectReturn(Object.assign({}, request, response.returnInput, { returnRequest: response.receivedReturn })); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    /**
     * Applies inventory disposition within the fulfillmentCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    applyInventoryDisposition: async function (request, response, process) { try { let intent = response.inspectedReturn.inventoryDispositionIntent; if (!intent) response.inventoryDisposition = { status: 'NO_INVENTORY_DISPOSITION_REQUIRED', movements: [] }; else { let serviceName = this.config().inventoryDispositionService || 'DefaultReturnDispositionMovementService'; let service = SERVICE[serviceName]; if (!service || typeof service.execute !== 'function') throw this.error('Inventory disposition owner service is unavailable'); response.inventoryDisposition = await service.execute({ tenant: request.tenant, authData: request.authData, dispositionIntent: intent }); } process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    /**
     * Executes the close return operation within the fulfillmentCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    closeReturn: async function (request, response, process) { try { response.closedReturn = await SERVICE.DefaultReturnRequestService.closeReturn(Object.assign({}, request, response.returnInput, { returnRequest: response.inspectedReturn, inventoryDispositionEvidence: response.inventoryDisposition })); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    /**
     * Handles success end within the fulfillmentCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    handleSuccessEnd: function (request, response, process) { process.resolve({ returnRequest: response.closedReturn, inventoryDisposition: response.inventoryDisposition }); },
    /**
     * Handles error end within the fulfillmentCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} response Value defined by the surrounding Nodics operation contract.
     * @param {*} process Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    handleErrorEnd: function (request, response, process) { process.reject(response.error || this.error('Return receipt disposition Pipeline failed')); },
};
