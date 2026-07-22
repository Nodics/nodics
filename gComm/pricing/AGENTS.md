# Pricing Agent Contract

Follow the root Nodics contract and `gComm/AGENTS.md`.

- Pricing owns Price Lists, scoped Price List assignments, Price Groups and memberships, exact Price records, and deterministic Price resolution.
- Store, Profile, Product/item, Units, Tax, Promotion, exchange-rate, Workflow, nPublish, and cache capabilities remain authoritative for their own concerns. Reference them through configured providers; never copy their master data.
- Every persisted Pricing record is tenant- and authenticated-enterprise scoped. Never trust enterprise ownership from a request payload.
- Keep money and quantities as validated exact decimal strings. Never use JavaScript floating-point arithmetic for commercial decisions.
- Resolve from explicit context using configured scope specificity, assignment priority, list priority, item/customer specificity, quantity tier, validity, currency, and unit. Fail closed on an unresolved tie.
- Exact currency and unit matching is the default. Currency conversion requires an explicit configured provider; Unit conversion remains Units-owned.
- Generated Pricing CRUD routers remain disabled. Public or BackOffice mutations must use approved intent APIs, permissions, validation, audit, and lifecycle transitions.
- Price maintenance happens in a versioned Staged runtime. Approval uses existing Workflow and nPublish; Online is a distinct non-versioned runtime activated only from integrity-checked immutable manifests.
- Online resolution may use `DefaultCacheService` only. Never call NodeCache, Redis, or Hazelcast implementations directly, and invalidate after price changes, activation, and rollback.
- Do not merge tax calculation or promotion evaluation into base-price resolution. Compose these authorities at Cart/Order boundaries.
- Keep classifications, ranking, limits, target connections, timeouts, and providers in layered `properties.js`.
- Public Storefront resolution must introspect an opaque handle for the `pricing` audience, replace caller scope, and delegate to the existing Online resolver and cache; never trust browser tenant, enterprise, Site, Store, currency, channel, or customer qualifiers.
- Every implementation change requires positive, negative, boundary, contract, integration, regression, business-user, operator, developer, customization, and recovery coverage.
