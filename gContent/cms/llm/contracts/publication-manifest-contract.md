# CMS Publication Manifest AI Contract

- Never implement CMS lifecycle state outside `nPublish`.
- Never treat `versionId` alone as the Online publication pointer.
- Staged and Online must be separate systems or database/schema authorities;
  Staged must never update Online persistence directly.
- Freeze exact route, page, association, component, template, and slot versions
  in an immutable CMS publication manifest.
- Select Online content through the tenant/site/path/locale/channel/access-mode
  pointer using optimistic compare-and-set updates owned by the target runtime.
- Send integrity-protected immutable manifests through the configured transport,
  authenticate with the existing module-token contract, and require a target
  deployment receipt before nPublish records Online success.
- Mark target routes with `authTokenTypes: ['service']`; internal permission
  alone must not allow a human access token to impersonate a module.
- Preserve one correlation ID across Staged lifecycle, manifest, target pointer,
  and deployment receipt without logging credentials.
- Concurrent identical target writes must converge idempotently; target outage
  must retain the previous Online pointer and produce an auditable failed release.
- When `cms.publication.enabled` is true, delivery must use only the manifest
  authority and fail closed; do not add a legacy fallback path.
- Enable selected CMS schema `isVersionedEnabled` flags only in a layer that also
  activates the existing versioned database contract; default CMS must remain
  deployable without that variant.
- Keep graph limits, supported root types, and service providers layered and
  overridable.
- Keep scheduling in cronjob, generic lifecycle/audit in nPublish, physical
  versions in database variants, and CMS dependency/delivery rules in CMS.
