<!--
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
-->

# Security Policy

Nodics treats security as a framework capability, not a feature added at the end. Every change must preserve tenant isolation, permission boundaries, token handling, auditability, generated API contracts, and module ownership.

## Supported branches

- `master` is the release baseline.
- `development` is the integration baseline for accepted work.
- Feature branches are supported only while an active change is under review.

Security fixes are prepared against `development`, validated through the governed release gate, and promoted to `master` after review.

## Reporting vulnerabilities

Do not open public issues for suspected vulnerabilities. Report privately through the Nodics maintainer or the security contact in the active commercial/support agreement.

Include:

- affected branch or commit;
- affected module, route, schema, provider, or generated artifact;
- reproduction steps;
- expected and actual behavior;
- tenant, permission, token, or data-exposure impact;
- whether the issue requires emergency remediation, compatibility handling, or migration.

## Security expectations

Every security-sensitive change must cover:

- authentication and authorization behavior;
- tenant and enterprise scope;
- service-token versus human-token boundaries;
- private data and internal path redaction;
- configuration defaults and environment overrides;
- audit, diagnostics, and error traceability;
- tests proving both allowed and rejected behavior.

Generated routes, generated tests, OpenAPI contracts, and governance reports are part of the security evidence. A manual implementation that bypasses these contracts is not release-ready.

