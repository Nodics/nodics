# Add a project pricing scope

In a later project module, extend `pricing.assignment.scopeTypes`, add its numeric `scopeSpecificity`, and override or compose `DefaultPriceResolutionService.scopeValues` so the new value comes from trusted request context. Add a configured authoritative reference provider when the scope points to master data.

Do not copy Pricing schemas or create a second resolver. Test that the new scope is enterprise-isolated, bounded, ordered deterministically, published through the same Pricing manifest, and rejected when its reference is invalid.
