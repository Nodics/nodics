# Compliance Core

`complianceCore` is the provider-neutral shared owner for compliance-wide
configuration and presentation contracts. It publishes the root Axis
**Compliance Management** section and common security defaults. It does not
own KYC cases, AML investigations, sanctions results, provider payloads, or
another capability's lifecycle.

Configuration resolves through the normal Nodics project, environment,
server, node, tenant, and customer hierarchy. A later customer module may
override labels, permissions, masking, retention, legal-hold policy, or add a
new child capability while retaining one backend-authorized navigation tree.

Business users enter Compliance Management in Axis and see only capabilities
and actions authorized by the backend. Developers add a new compliance domain
as a sibling capability and attach its navigation items to
`compliance-management`; they must not create a parallel compliance console.

Shared runtime services:

- `DefaultComplianceContextService` resolves authenticated tenant, enterprise,
  and subject scope and rejects caller-supplied scope conflicts.
- `DefaultComplianceGovernanceService` provides permission enforcement,
  masking, retention/legal-hold classification, and bounded audit evidence.

These are replaceable defaults. A later project or customer module can override
either registered service or contribute stricter layered configuration without
editing `complianceCore`. Overrides must retain fail-closed tenant isolation,
permission enforcement, and safe evidence projections. KYC-specific case,
provider, review, and decision behavior remains under `gCompliance/kyc`.
