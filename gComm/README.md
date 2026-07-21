# gComm

`gComm` is the commerce group module. It composes commerce capabilities such as cart and order and provides the shared configuration layer for commerce-oriented project modules.

Use this group for composition and shared commerce defaults. Capability behavior belongs in child modules such as `cart`, `order`, `store`, `inventory`, `pricing`, and `product`.

Pricing provides reusable scoped Price Lists, Price Groups, exact Price records,
deterministic Online resolution, and Workflow/nPublish-controlled Staged-to-Online
release. See [Pricing](pricing/README.md).

Product provides enterprise-scoped Product Item and alternate-Identifier
identity, governed lifecycle, Catalog and Unit reference validation, human
management intents, and service-token lookup. See [Product](product/README.md).

Commerce extensions should keep framework contracts intact: schemas, routers, services, pipelines, access control, validation, audit, and tests remain the source of behavior.
