# Anthropic Provider

This disabled provider module implements Anthropic Messages API translation
for `aiProviders`: normalized generation, conservative estimation, tool use,
cancellation, completed-message normalization, and typed stream deltas.

Projects must activate this module explicitly. Callers continue to use an
`aiProviders` usage profile and never call this module directly.
