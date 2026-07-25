# OpenAI Provider Contracts

The future adapter must implement and register only the normalized
`aiProviders` capabilities it actually supports. It must not expose an
OpenAI-specific caller API or own provider selection.
