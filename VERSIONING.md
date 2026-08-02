<!--
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
-->

# Versioning Policy

Nodics versioning must communicate framework compatibility, migration risk, and customer-module impact.

## Version signals

- Major changes may break public framework contracts, generated API contracts, schema behavior, provider interfaces, or customization contracts.
- Minor changes add compatible capability, extension points, provider support, generated evidence, or documentation.
- Patch changes fix defects, governance gaps, security issues, tests, or documentation without changing public behavior.

## Compatibility evidence

Before a version is promoted, the change must state whether it affects:

- schema shape or persistence;
- generated routes or OpenAPI contracts;
- service/provider interfaces;
- permission or tenant behavior;
- generated tests or data;
- custom-module override contracts.

If compatibility cannot be proven, the change must include a migration or deprecation plan.

