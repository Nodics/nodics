# Pricing capability contract

Pricing owns commercial price selection, not Product, Store, Profile, Units, Tax, Promotion, Workflow, publishing, or cache-provider truth.

Implementations must preserve tenant and authenticated-enterprise isolation, exact decimal-string values, deterministic configurable ranking, bounded queries, fail-closed ambiguity, disabled generated CRUD routers, human-only permissioned management/preview intents, service-token-only resolution and target deployment, immutable publication manifests, distinct Staged and Online runtimes, atomic Online activation, audit evidence, idempotency, and provider-neutral caching.

BackOffice discovers Pricing from registry metadata and calls Pricing directly. Pricing derives enterprise scope from the human access identity, rejects service tokens on management APIs, ignores client-owned internal identity fields, projects only allow-listed fields, retires rather than deletes, and reuses generated services, validation interceptors, and the deterministic resolver. The registry is not a Pricing proxy or authority.

Pricing publication submissions must use the existing Workflow engine. Manual and automatic flow definitions may differ, but approved paths must converge on `DefaultPublicationLifecycleService.publishApproved`; never invoke a target transport as an approval substitute. Carrier identities and associated versioned items are immutable workflow evidence. Staged enables versioning and publish variants; Online remains non-versioned and never runs approval flows.

Extend with later layered modules and configured providers. Never copy an authoritative model, introduce another workflow/publisher/cache loader, resolve from Staged data in an Online request, accept arbitrary provider URLs, silently convert currency, or use floating-point money.
