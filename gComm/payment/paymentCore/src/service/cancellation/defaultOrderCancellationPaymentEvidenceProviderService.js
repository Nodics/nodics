/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module payment/service/cancellation/DefaultOrderCancellationPaymentEvidenceProviderService @description Projects normalized original Payment state for cancellation eligibility. @layer service @owner payment */
module.exports = {
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    resolve: async function (request) { if (!request || !request.tenant || !request.authData || request.authData.tokenType !== 'service' || !request.entCode || !request.orderCode || !Array.isArray(request.items)) throw new CLASSES.NodicsError('ERR_PAY_00011', 'Payment cancellation evidence requires internal Order context'); let response = await SERVICE.DefaultPaymentTransactionService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: request.entCode, orderCode: request.orderCode }, searchOptions: { limit: 101 } }); let transactions = response && Array.isArray(response.result) ? response.result : []; if (transactions.length > 100) throw new CLASSES.NodicsError('ERR_PAY_00011', 'Payment cancellation evidence exceeds transaction bounds'); let originals = transactions.filter(value => ['AUTHORIZE', 'CAPTURE', 'DEFER'].includes(value.operation) && !['VOIDED', 'REFUNDED', 'FAILED', 'CANCELLED'].includes(value.status)); let priority = { SETTLED: 4, CAPTURED: 3, AUTHORIZED: 2, DEFERRED: 1, UNPAID: 0 }; let state = originals.reduce((selected, value) => (priority[value.status] || 0) > (priority[selected] || 0) ? value.status : selected, 'UNPAID'); return { orderCode: request.orderCode, items: request.items.map(item => ({ orderEntryCode: item.orderEntryCode, state: state, transactionCodes: originals.map(value => value.transactionCode), transactions: originals.map(value => ({ transactionCode: value.transactionCode, paymentGroupCode: value.paymentGroupCode, providerCode: value.providerCode, paymentModeCode: value.paymentModeCode, amount: value.amount, currencyCode: value.currencyCode, status: value.status })) })) }; },
};
