# Customer adapter example

A later customer module contributes `kyc.providers.adapters.customerIdentity = 'CustomerIdentityKycProviderAdapterService'`, implements the required operations, and adds conformance plus guarded sandbox/live tests. Keep case state in KYC Core and secrets in governed secret configuration.
