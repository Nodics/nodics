# gAi AI Guidance

Read the repository contract, `gAi/AGENTS.md`, the nearest child contract, and
generated context before changing an AI module.

Preserve the mandatory dependency direction:

```text
aiAssistant -> aiProviders
aiKnowledge -> aiProviders
vendor provider -> aiProviders adapter contract
```

Never add a direct caller-to-vendor path.
