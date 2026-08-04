# Compliance

`gCompliance` is the composition-only home for regulated compliance
capabilities. It keeps shared compliance governance in `complianceCore` and
places purpose-specific capabilities, such as KYC, in sibling capability
families. The group owns no business records or duplicate runtime behavior.

Axis discovers the single **Compliance Management** section from backend
capability metadata. Each compliance capability contributes only its own
authorized pages beneath that shared section. Customer modules can extend or
replace policy, services, schemas, navigation metadata, and provider adapters
through later-loaded Nodics layers without editing this framework group.

Current capability families:

- `complianceCore`: shared terminology, safe presentation, policy defaults,
  and the root Compliance Management navigation contract;
- `kyc`: identity-verification schemas, orchestration, API, review, audit, and
  provider adapters.
