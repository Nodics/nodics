/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert = require('assert');
const config = require('../config/properties');

describe('Compliance Management contract', function () {
    it('publishes one backend-owned Axis section root', function () {
        const capability = config.backofficeCapabilities.complianceCore;
        assert.strictEqual(capability.capabilityId, 'compliance-management');
        assert.strictEqual(capability.displayName, 'Compliance Management');
        assert.strictEqual(capability.navigation.length, 1);
        assert.strictEqual(capability.navigation[0].id, 'compliance-management');
        assert.strictEqual(capability.navigation[0].route, '/compliance-management');
        assert.deepStrictEqual(capability.navigation[0].perspectives, ['operations', 'configuration', 'audit']);
    });

    it('fails closed for shared compliance presentation and governance', function () {
        assert.strictEqual(config.compliance.presentation.exposeBackendAuthorizedNavigationOnly, true);
        assert.strictEqual(config.compliance.presentation.maskSensitiveValuesByDefault, true);
        assert.strictEqual(config.compliance.presentation.exposeProviderSecrets, false);
        assert.strictEqual(config.compliance.presentation.exposeRawEvidence, false);
        assert.strictEqual(config.compliance.governance.makerCheckerForSensitiveChanges, true);
        assert.strictEqual(config.compliance.governance.legalHoldOverridesDeletion, true);
    });
});
