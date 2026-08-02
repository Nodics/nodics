<!--
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
-->

# Release Governance

Nodics releases are governed through source-controlled tooling, not ad hoc scripts.

## Release branches

- `development` receives accepted changes after review and validation.
- `master` receives promoted release-ready changes.

## Release gate

The authoritative clean-checkout release gate is:

```sh
npm run release:check -- --execute
```

The full release-candidate gate is:

```sh
npm run release:check -- --execute --full
```

The release gate installs from the lockfile, audits runtime dependencies with `npm audit --omit=dev`, cleans generated output, rebuilds generated artifacts, validates LLM context, checks documentation quality, and runs governed tests.

GitHub Actions must delegate to the same root release command instead of duplicating release logic in workflow YAML.

## Release evidence

Release notes should include:

- branch and commit;
- validation commands;
- generated artifact status;
- dependency/security audit result;
- schema, route, OpenAPI, or migration impacts;
- compatibility and deprecation notes;
- known limitations.
