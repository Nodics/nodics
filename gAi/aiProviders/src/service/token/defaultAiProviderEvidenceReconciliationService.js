/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/service/token/DefaultAiProviderEvidenceReconciliationService
 * @description Looks up positive provider usage and delegates uncertain reconciliation to the ledger repair authority.
 * @layer service
 * @owner aiProviders
 * @override Provider modules may add truthful lookup support; absence must remain fail closed.
 */
module.exports = {
    /** Reconciles only when an adapter returns positive usage evidence. */
    reconcile: async function (input) {
        const evidence = await input.gateway.lookupUsage(
            input.providerCode, input.providerRequestId, input.context, input.configuration);
        if (!evidence || evidence.found !== true || !evidence.usage) {
            return { reconciled: false, reason: evidence && evidence.reason || 'PROVIDER_EVIDENCE_UNAVAILABLE' };
        }
        await input.repairService.reconcileUncertain({
            evidence: {
                reservationId: input.reservationId,
                providerRequestId: evidence.providerRequestId,
                evidenceSource: 'PROVIDER',
                usage: evidence.usage
            },
            context: input.context
        });
        return { reconciled: true, providerRequestId: evidence.providerRequestId };
    }
};
