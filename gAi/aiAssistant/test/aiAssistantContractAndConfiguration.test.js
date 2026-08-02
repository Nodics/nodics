/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const properties = require('../config/properties').aiAssistant;
const contracts = require('../src/schemas/apiContracts');
const service = require('../src/service/config/defaultAiAssistantConfigurationService');

assert.strictEqual(service.validate(properties), true);
assert.strictEqual(properties.enabled, false, 'Assistant must be disabled until an environment selects governed providers');
assert.strictEqual(properties.security.allowBrowserCredentials, false);
assert.strictEqual(properties.tools.requireTargetAuthorization, true);
assert.strictEqual(properties.tools.requireConfirmationForMutations, true);
assert.strictEqual(contracts.contractVersion, 1);
assert(contracts.streamEvent.properties.eventType.enum.includes('TEXT_DELTA'));
assert(contracts.streamEvent.properties.eventType.enum.includes('CONFIRMATION_REQUIRED'));

const configured = JSON.parse(JSON.stringify(properties));
configured.providerProfile = 'projectAssistantGeneration';
const snapshot = service.snapshot(configured, { providerProfile: 'partnerProject' });
assert(Object.isFrozen(snapshot));
assert.strictEqual(snapshot.effective.providerProfile, 'projectAssistantGeneration');
assert.strictEqual(snapshot.origins.providerProfile, 'partnerProject');

const unknown = JSON.parse(JSON.stringify(properties));
unknown.parallelConfigurationAuthority = {};
assert.throws(() => service.validate(unknown), /Unknown Assistant configuration keys/);

const unsafe = JSON.parse(JSON.stringify(properties));
unsafe.promptApiKey = 'must-not-be-here';
assert.throws(() => service.validate(unsafe), /Unknown Assistant configuration keys|forbidden inline secret/);

const weakened = JSON.parse(JSON.stringify(properties));
weakened.tools.requireTargetAuthorization = false;
assert.throws(() => service.validate(weakened), /target authorization/);

const unsafeOptimization = JSON.parse(JSON.stringify(properties));
unsafeOptimization.contextOptimization.preserveSecurityInstructions = false;
assert.throws(() => service.validate(unsafeOptimization), /cannot remove governed instructions/);

assert.strictEqual(contracts.providerResult, undefined, 'Provider contracts must belong to aiProviders');

console.log('Assistant contract and configuration tests passed');
