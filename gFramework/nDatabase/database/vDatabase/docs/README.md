# vDatabase Documentation

This folder contains permanent human-readable documentation for the `gFramework/nDatabase/database/vDatabase` module boundary.

Keep architecture, runtime contracts, configuration behavior, operational notes, troubleshooting, and extension decisions here when they are too detailed for the module `README.md`.

Update this folder whenever module behavior, public contracts, security posture, lifecycle, or customization rules change.

## Runtime selection contract

Versioning is selected independently for each owning-module schema:

- `super: 'base'` provides ordinary persistence metadata;
- `isVersionedEnabled: true` opts one schema into the active `versioned` contract;
- the effective runtime schema receives `versioned: true` and `versionId`;
- schemas without the opt-in remain non-versioned even when `vDatabase` is active;
- startup schema composition fails when opt-in is requested without the
  `vDatabase` contract.

The public configuration flag and the internal runtime flag intentionally have
different responsibilities. Module authors configure `isVersionedEnabled`;
database and service implementations consume the derived `versioned` flag.

Publishing workflow state and database record versioning are separate
contracts. For example, an nPublish request may use a workflow `revision`
without storing versioned copies of the request itself.
