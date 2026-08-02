<!--
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
-->

# Contributing to Nodics

Nodics contributions must preserve the framework principle: configuration-first, modular, layered, test-backed, and customizable without editing released framework code for customer-specific behavior.

## Before changing code

1. Read `AGENTS.md` for AI/developer working rules.
2. Read the relevant module `README.md` for business and technical intent.
3. Confirm the owning module. Do not add parallel services, routes, schemas, renderers, or config paths for behavior already owned by another module.
4. Decide whether the change belongs in framework, project, environment, server, node, tenant, provider, or data configuration.

## Implementation rules

- Keep root `package.json` as the only npm dependency authority.
- Keep module `package.json` files metadata-only.
- Keep `properties.js` files configuration-only; move behavior to services, utils, adapters, or providers.
- Preserve generated artifact workflows. Do not manually edit generated output as source.
- Add tests with the implementation, including override/customization tests when an extension point is changed.
- Update canonical documentation when user-facing or extension-facing behavior changes.

## Required validation

For source or test changes involving generated context, run:

```sh
npm run llm:generate
npm run llm:validate
```

For release-quality changes, run the governed release gate:

```sh
npm run release:check -- --execute
```

