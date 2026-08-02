<!--
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
-->

# Deprecation Policy

Deprecation is a governed lifecycle decision. Do not remove framework contracts silently.

## Deprecation requirements

A deprecation must define:

- the deprecated schema, route, service, provider, configuration, or generated contract;
- the replacement path;
- affected modules and customer overrides;
- migration steps;
- validation commands;
- removal target, if known;
- rollback and compatibility notes.

Deprecated behavior must remain explicit in documentation and tests until removed. Compatibility shims should be temporary and justified; new work should prefer clean framework contracts unless a compatibility path is approved.

