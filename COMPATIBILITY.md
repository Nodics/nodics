<!--
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
-->

# Compatibility Policy

Nodics compatibility is measured through contracts, generated artifacts, and runtime topology evidence.

## Compatibility surfaces

- module and package metadata;
- schema definitions and generated CRUD behavior;
- route contracts and OpenAPI output;
- service, provider, adapter, workflow, and pipeline interfaces;
- tenant, enterprise, permission, and token behavior;
- environment/server/node topology;
- generated tests and generated LLM context.

## Compatibility decisions

When a change affects an existing contract, the owner must choose one of:

- compatible additive change;
- documented migration;
- temporary compatibility shim;
- intentional breaking change with release approval.

Customer-specific behavior should be implemented through customer modules, configuration, providers, or data extensions rather than modifying framework source.

