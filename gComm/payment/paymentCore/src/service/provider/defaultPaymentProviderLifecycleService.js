/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/service/provider/DefaultPaymentProviderLifecycleService
 * @description Operates safe Payment Provider lifecycle actions for Axis without storing credentials or raw gateway payloads.
 * @layer service
 * @owner payment
 * @override Project modules may replace connector validation, live sandbox probes, rotation-request publishing, or approval workflow integration.
 */
module.exports = {
    /** Initializes provider lifecycle operations. */
    init: function () { return Promise.resolve(true); },
    /** Completes provider lifecycle operations startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Creates a stable lifecycle error. */
    error: function (message, code) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, code || 'ERR_PAY_00009');
        let error = new Error(message);
        error.code = code || 'ERR_PAY_00009';
        return error;
    },
    /** Extracts result arrays from Nodics service responses. */
    items: function (response) {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.result)) return response.result;
        if (response && response.result && Array.isArray(response.result.items)) return response.result.items;
        if (response && Array.isArray(response.items)) return response.items;
        return [];
    },
    /** Resolves one provider from request model, code, governed records, or module configuration. */
    provider: async function (request) {
        let body = (request || {}).body || {};
        let model = (request || {}).model || body.model || body.provider;
        if (model && model.providerCode) {
            return SERVICE.DefaultPaymentPolicyService.prepareProvider({ model: Object.assign({}, model) });
        }
        let providerCode = body.providerCode || (request || {}).providerCode;
        if (!providerCode) throw this.error('Payment Provider lifecycle requires providerCode');
        let registry = SERVICE.DefaultPaymentProviderRegistryService;
        if (registry && typeof registry.providerForRequest === 'function') {
            return registry.providerForRequest(providerCode, request || {});
        }
        if (registry && typeof registry.provider === 'function') return registry.provider(providerCode);
        throw this.error('Payment Provider registry is unavailable');
    },
    /** Persists a provider status update when governed provider services are active. */
    saveStatus: async function (request, provider, status) {
        let model = Object.assign({}, provider, {
            status: status,
            lifecycleUpdatedAt: new Date(),
        });
        SERVICE.DefaultPaymentPolicyService.prepareProvider({ model: model });
        if (typeof SERVICE !== 'undefined'
            && SERVICE.DefaultPaymentProviderService
            && typeof SERVICE.DefaultPaymentProviderService.save === 'function') {
            await SERVICE.DefaultPaymentProviderService.save({
                tenant: request && request.tenant,
                authData: request && request.authData,
                model: model,
            });
        }
        return model;
    },
    /** Returns a bounded safe provider summary for Axis. */
    summary: function (provider, action, extra) {
        return Object.assign({
            providerCode: provider.providerCode,
            providerType: provider.providerType,
            displayName: provider.displayName,
            methodCodes: provider.methodCodes || provider.paymentModes || [],
            operations: provider.operations || [],
            adapterService: provider.adapterService,
            policyService: provider.policyService,
            connectorCode: provider.connectorCode,
            configRef: provider.configRef,
            status: provider.status,
            configurationSource: provider.configurationSource,
            action: action,
            credentialManagedExternally: true,
            secretsStoredInPayment: false,
        }, extra || {});
    },
    /** Maps externally declared lifecycle action ids to internal service methods. */
    actionHandlers: function () {
        return {
            'create-payment-provider': 'validateProvider',
            'validate-payment-provider': 'validateProvider',
            'test-payment-provider': 'testProvider',
            'activate-payment-provider': 'activateProvider',
            'suspend-payment-provider': 'suspendProvider',
            'request-provider-connector-rotation': 'requestConnectorRotation'
        };
    },
    /** Executes one externally declared lifecycle action through an explicit allowlist. */
    execute: async function (request) {
        let body = (request || {}).body || request || {};
        let actionId = body.actionId || body.action || body.lifecycleActionId;
        if (!actionId) throw this.error('Payment Provider lifecycle actionId is required');
        let handlerName = this.actionHandlers()[actionId];
        if (!handlerName || typeof this[handlerName] !== 'function') {
            throw this.error('Payment Provider lifecycle action is unsupported');
        }
        if (body.provider && !body.model) body.model = body.provider;
        let result = await this[handlerName](Object.assign({}, request, body, { body: body }));
        return Object.assign({
            actionId: actionId,
            handlerAction: 'DefaultPaymentProviderLifecycleService.' + handlerName
        }, result || {});
    },
    /** Validates provider metadata, adapter availability, connector references, and unsafe-field governance. */
    validateProvider: async function (request) {
        let provider = await this.provider(request || {});
        SERVICE.DefaultPaymentPolicyService.prepareProvider({ model: Object.assign({}, provider) });
        let adapterAvailable = typeof SERVICE !== 'undefined' && provider.adapterService && SERVICE[provider.adapterService];
        let registered = typeof SERVICE !== 'undefined'
            && SERVICE.DefaultPaymentProviderGatewayService
            && SERVICE.DefaultPaymentProviderGatewayService.registeredAdapters
            && SERVICE.DefaultPaymentProviderGatewayService.registeredAdapters[provider.providerCode];
        if (!adapterAvailable && !registered) throw this.error('Payment Provider adapter is not active for ' + provider.providerCode);
        let connectorValidation = SERVICE.DefaultPaymentProviderConnectorPolicyService
            ? SERVICE.DefaultPaymentProviderConnectorPolicyService.validateProvider(provider)
            : { connectorReferencePresent: !!(provider.connectorCode || provider.configRef) };
        return this.summary(provider, 'VALIDATE_PROVIDER', {
            valid: true,
            adapterAvailable: true,
            connectorReferencePresent: connectorValidation.connectorReferencePresent,
            credentialsResolved: false,
        });
    },
    /** Performs a safe provider test through normalized reconciliation evidence. */
    testProvider: async function (request) {
        let provider = await this.provider(request || {});
        await this.validateProvider(Object.assign({}, request, { model: provider }));
        let operation = (provider.operations || []).includes('RECONCILE') ? 'RECONCILE' : ((provider.operations || [])[0] || 'AUTHORIZE');
        let mode = (provider.methodCodes || provider.paymentModes || ['OFFLINE'])[0];
        let evidence = await SERVICE.DefaultPaymentProviderGatewayService.executeOperation({
            enterpriseCode: provider.enterpriseCode || (request || {}).enterpriseCode || (request || {}).entCode,
            tenant: request && request.tenant,
            authData: request && request.authData,
            transaction: {
                enterpriseCode: provider.enterpriseCode || (request || {}).enterpriseCode || (request || {}).entCode || 'default',
                transactionCode: 'provider-test::' + provider.providerCode,
                idempotencyKey: 'provider-test::' + provider.providerCode,
                providerCode: provider.providerCode,
                paymentModeCode: mode,
                paymentGroupCode: 'provider-test',
                operation: operation,
                amount: '0',
                currencyCode: (request && request.currencyCode) || 'USD',
            },
        }, String(operation).toLowerCase() === 'reconcile' ? 'reconcile' : 'authorize', [operation]);
        return this.summary(provider, 'TEST_PROVIDER', {
            valid: true,
            testStatus: evidence.status,
            providerTransactionRef: evidence.providerTransactionRef,
            reconciliationCode: evidence.reconciliationCode,
        });
    },
    /** Activates a governed provider after validation. */
    activateProvider: async function (request) {
        let provider = await this.provider(request || {});
        await this.validateProvider(Object.assign({}, request, { model: Object.assign({}, provider, { status: 'ACTIVE' }) }));
        let model = await this.saveStatus(request || {}, provider, 'ACTIVE');
        return this.summary(model, 'ACTIVATE_PROVIDER', { valid: true });
    },
    /** Suspends a governed provider without deleting payment evidence. */
    suspendProvider: async function (request) {
        let provider = await this.provider(request || {});
        let model = await this.saveStatus(request || {}, provider, 'SUSPENDED');
        return this.summary(model, 'SUSPEND_PROVIDER', { valid: true });
    },
    /** Publishes a safe connector rotation request boundary without reading or changing secrets. */
    requestConnectorRotation: async function (request) {
        let provider = await this.provider(request || {});
        let rotation = SERVICE.DefaultPaymentProviderConnectorPolicyService
            ? SERVICE.DefaultPaymentProviderConnectorPolicyService.rotationRequest(provider)
            : {
                rotationRequired: true,
                rotationAuthority: 'connector-secret-authority',
            };
        return this.summary(provider, 'REQUEST_CONNECTOR_ROTATION', {
            valid: true,
            rotationRequired: rotation.rotationRequired,
            rotationAuthority: rotation.rotationAuthority,
        });
    },
};
