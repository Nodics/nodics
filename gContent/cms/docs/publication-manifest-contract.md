# CMS Publication Manifest Contract

CMS integrates with the generic `nPublish` lifecycle through
`DefaultCmsPublicationAdapterService` and
`DefaultCmsPublicationVersionProviderService`. CMS owns content dependency and
delivery interpretation; `nPublish` remains the lifecycle and audit authority;
versioned database variants remain the physical version authority.

## Immutable release unit

The supported default root is `pageRoute`. Validation resolves the exact route,
page, component association, component, template, and slot versions. The Staged
system stores those identities and a client-safe delivery snapshot in an
immutable `cmsPublicationManifest` release package.

Staged and Online are always separate systems or database/schema authorities.
The configured target transport sends the immutable package with a module
service token to the Online CMS target. The target validates integrity, imports
the complete manifest idempotently, records a deployment receipt, and only then
switches its target-local `cmsOnlinePublicationPointer`.

The three target routes declare `authTokenTypes: ['service']` in addition to
the configurable internal-token permission. Missing credentials, API-key
identities, and human access tokens therefore fail before controller execution.
Staged also fails locally when no tenant-scoped internal token is available.

The pointer selects one manifest for a tenant-scoped site, path, locale,
channel, and access-mode scope and uses an optimistic revision update.
Activation replays are idempotent. Rollback is sent to the target and can select
only a release previously deployed there. Staged never writes the Online
database or pointer directly.

Concurrent identical first deployments converge on one deterministic pointer
and one deployment receipt. A conflicting pointer revision fails with a
governed conflict instead of overwriting another release.

## Delivery authority

`cms.publication.enabled` selects the delivery authority:

- `false` keeps the existing route/page/component delivery contract active;
- `true` requires an Online manifest pointer and serves only its frozen snapshot.

There is no runtime fallback between these modes. Operators must build and
activate manifests before enabling manifest delivery for a tenant deployment.
Missing pointers or manifests fail closed.

The Staged runtime configures `cms.publication.targetTransportProvider` and
target module connection settings. The default is `null`, so publishing fails
closed until an explicit target is configured. The supplied module transport
uses `DefaultModuleService`, existing server/module resolution, internal bearer
tokens, bounded timeouts, retries, and deterministic idempotency keys.
The Staged correlation ID is propagated through the internal request and is
stored on the target manifest, active pointer, and deployment receipt.

If Online is unavailable, Staged records an auditable `FAILED` terminal state
and Online retains its previous pointer. After the target recovers, operators
submit a new publication identity for the same source version; failed audit
history is not silently rewritten.

Every deployment must declare `cms.publication.runtimeRole` explicitly as
`STAGED` or `ONLINE`. Source version lookup, manifest construction, deployment,
and rollback initiation fail outside `STAGED`. Target import, pointer switching,
status, and target rollback fail outside `ONLINE`; they also fail if the Online
process activates `publishEnabled`. The target module connection cannot use the
default/self alias.

Default CMS keeps publication and per-schema versioning disabled so deployments
without a versioned database variant continue to start normally. A project or
environment layer enabling manifest publication must also activate the existing
versioned database contract and override the selected CMS schemas with
`isVersionedEnabled: true`. Do not force versioning into unrelated CMS
deployments.

## Customization

Projects may extend `cms.publication.rootTypes` and override adapter, manifest,
or version-provider services through the normal module hierarchy. Extensions
must retain exact-version reads, bounded dependency traversal, tenant isolation,
deterministic manifest integrity, pointer compare-and-set, idempotent activation,
and rollback behavior.
