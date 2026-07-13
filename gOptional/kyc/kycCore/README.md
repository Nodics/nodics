# kycCore Module

`kycCore` owns core KYC business behavior. It provides the service, pipeline, interceptor, utility, configuration, and test space for KYC lifecycle rules.

Use this module for provider-neutral KYC logic and workflow. API request handling belongs in `kycApi`, and schema/data definitions belong in `kycSchema`.

KYC changes must be privacy-aware, auditable, tenant-isolated, configurable, and covered by tests.
