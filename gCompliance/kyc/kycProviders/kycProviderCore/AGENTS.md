# KYC Provider Core agent contract

Inherit `../../../../AGENTS.md` and parent KYC contracts. Follow global AI/development guidance in `../../../../gSetup/llm/ai-enablement-index.md`. Own provider selection, conformance, safe normalization, live-call gating, timeout/retry/failover policy, webhook envelope verification, and readiness. Do not own a case decision or persist raw payloads. New providers register through layered `kyc.providers.adapters` configuration.
