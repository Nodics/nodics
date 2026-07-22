# cmsStagedServer

`cmsStagedServer` is the local Staged publishing runtime for CMS,
Pricing, and Product authoring and approval in the `startio` reference
application. Its CMS-oriented runtime name does not make CMS the owner of
Pricing or Product.

Use this module for local CMS server activation and runtime topology. CMS
behavior belongs in content modules such as `cms` and `wcms`.

Local server settings should remain explicit, replaceable, and isolated from shared capability logic.

This process activates Nodics publish variants and overrides CMS business
schemas with `isVersionedEnabled: true`. Approved CMS, Pricing, and Product
workflows deploy frozen manifests through separate named `cmsOnline`,
`pricingOnline`, and `productOnline` connections to the same local Online
publishing process. Each target call still addresses its owning module API
directly. The Staged database is separate from Online and must not serve Online
delivery as a fallback.
