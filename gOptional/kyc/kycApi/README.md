# kycApi Module

`kycApi` owns the API-facing KYC capability. It depends on `kycCore` and provides route, controller, facade, service, pipeline, interceptor, utility, and test space for KYC requests.

Use this module for KYC API contracts and request handling. Core KYC rules belong in `kycCore`, and schema/data definitions belong in `kycSchema`.

KYC API changes must preserve access control, audit, validation, tenant context, diagnostics, and privacy-sensitive data handling.
