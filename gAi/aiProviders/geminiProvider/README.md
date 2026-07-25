# Gemini Provider

This disabled provider module implements Gemini API and Vertex AI translation
for `aiProviders`: normalized generation and embeddings, conservative
estimation, function calls, cancellation, and Gemini SSE deltas.

Projects must activate this module explicitly. Callers continue to use an
`aiProviders` usage profile and never call this module directly.
