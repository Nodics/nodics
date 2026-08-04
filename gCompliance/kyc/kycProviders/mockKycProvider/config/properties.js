/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module mockKycProvider/config/properties @description Registers the deterministic mock adapter. */
module.exports = { kyc: { providers: { adapters: { mockKyc: 'DefaultMockKycProviderAdapterService' } } } };
