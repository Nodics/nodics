# Gemini Provider Contracts

The future adapter must implement and register only the normalized
`aiProviders` capabilities it actually supports. Gemini API and Vertex AI
details remain inside this module; it must not expose a vendor-specific caller
API or own provider selection.
