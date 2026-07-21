# Units Agent Contract

Follow root and `gCore/AGENTS.md` contracts.

- Units is the shared authority for dimensions, units, exact conversions, rounding, and regional conversion meaning.
- Never use JavaScript binary floating-point for authoritative measured quantities or conversion factors.
- Persist canonical decimal strings and positive rational numerator/denominator factors; database adapters may optimize storage without changing the contract.
- Regional land units require geographic scope and deterministic most-specific selection; ambiguity fails closed.
- Optional multi-hop conversion must remain bounded, exact, cycle-safe, shortest-path-only, and fail closed when more than one shortest path qualifies.
- Domain modules own business meaning such as stock, parcel, title, surveyed area, cultivable area, yield, price, or packaging.
- Geospatial polygons and legal/surveyed area are separate evidence sources; Units only converts declared numeric measurements.
- Keep generated CRUD routers private until approved intent APIs and security tests exist.
- The internal conversion intent route is the single modular bridge over Units services. It must remain service-token-only, bounded, allow-listed, and exact; never turn it into generic Unit CRUD.
- Retire definitions; do not hard-delete referenced dimensions, units, or conversions.
