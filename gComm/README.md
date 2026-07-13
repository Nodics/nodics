# gComm

`gComm` is the commerce group module. It composes commerce capabilities such as cart and order and provides the shared configuration layer for commerce-oriented project modules.

Use this group for composition and shared commerce defaults. Capability behavior belongs in child modules such as `cart` and `order`.

Commerce extensions should keep framework contracts intact: schemas, routers, services, pipelines, access control, validation, audit, and tests remain the source of behavior.
