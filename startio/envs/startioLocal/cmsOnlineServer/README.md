# cmsOnlineServer

`cmsOnlineServer` is the local Online publishing target for CMS,
Pricing, and Product. It runs those capabilities without publish/version
provider variants, imports only integrity-checked manifests from the
authenticated Staged runtime, and switches each module's target-local Online
pointers atomically. The historical server name is a reference-topology label,
not a module ownership boundary.

Its `startioCmsOnline` database is deliberately separate from the Staged CMS
database. This process does not run authoring approval workflows and must never be used as an authoring fallback.

Product delivery reads the active manifest pointer, not partially imported
records. Its delivery cache uses the configured nCache channel (local by
default in this reference topology). Product search projection remains disabled
until an nSearch engine, Product index, and indexer are explicitly configured;
durable projection jobs record skipped, successful, or retryable work.
