# OpenAI Provider

This disabled provider module implements OpenAI Responses API translation for
`aiProviders`: normalized generation, conservative estimation, tool calls,
cancellation, completed-response normalization, and typed SSE text deltas.

Projects must activate this module explicitly. Callers continue to use an
`aiProviders` usage profile and never call this module directly.
