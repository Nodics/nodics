# Storefront Agents

## Inheritance

- Follow the root Nodics AI contract: `../../AGENTS.md`.
- Follow the `gExp` group contract: `../AGENTS.md`.
- Follow global AI/development guidance: `../../gSetup/llm/ai-enablement-index.md`.

## Ownership

Storefront owns exact-hostname bootstrap resolution and customer-experience composition. CMS owns Sites/content, Store owns Store records, and commerce modules own their domain data. Reuse their reference contracts; never introduce a parallel authority.

## Work Rules

- Human management uses access tokens.
- Public resolution accepts no caller-supplied hostname override.
- Modular calls use internal service tokens.
- Keep application settings in `properties.js`.
- Leave `defaultSampleService.js` untouched.
- Provide beginner documentation plus positive, negative, boundary, contract, integration, and regression tests for every change.
