# Units Foundation Contract

- Units owns dimensions, units, conversion factors, rounding, and geographic conversion scope.
- Inputs and outputs are canonical decimal strings; authoritative arithmetic never uses binary floating point.
- A conversion factor is a positive exact rational numerator and denominator.
- Conversion is permitted only between equal dimension vectors.
- Regional matches select exactly one most-specific active/effective rule: locality, subdivision, country, then global.
- Ambiguous matches, missing geography, incompatible vectors, unavailable rules, and forbidden rounding fail closed.
- Business domains retain original value/unit evidence and own meaning such as stock, parcel area type, yield, pricing, or packaging.
- Do not hard-delete referenced definitions or expose generic CRUD publicly.
- Use `DefaultUnitsReferenceService` for co-hosted conversion and its service-token-only intent route for modular conversion; both transports preserve one Units authority.
- Bound Unit/conversion reads, expose only the approved projection, and fail closed for hidden, excessive, missing, incompatible, or ambiguous definitions.
- Multi-hop conversion remains optional, bounded, exact, shortest-path-only, and ambiguity-intolerant; Units remains the sole graph authority.
