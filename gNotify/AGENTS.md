# gNotify AI and Developer Contract

Inherit the root `../AGENTS.md` and global guidance in `../gSetup/llm/ai-enablement-index.md`.

- Keep `gNotify` composition-only. Put schemas in `notifySchema`, provider-neutral orchestration in `notifyCore`, verification composition in `notifyVerification`, transport in `notifyApi`, and vendor behavior in provider modules.
- Use configuration -> schema -> router/facade -> service -> Pipeline -> persistence/event boundaries. Customer modules customize with higher-layer configuration, services, pipelines, adapters, and init data; never customer conditionals in framework code.
- A business owner emits an intent and owns its context builder. `gNotify` must not become Order, KYC, Profile, Workflow, or provider business authority.
- Never persist, log, preview, return, or publish raw OTPs, secrets, credentials, full provider payloads, or unnecessary PII. Persist hashes, masks, references, codes, lengths, and normalized evidence.
- Keep channel separate from provider and centralize template lifecycle. Do not create parallel email/SMS/WhatsApp template authorities.
- Generated CRUD cannot mutate immutable delivery evidence. All mutation must pass owned services and interceptors. Hard delete is prohibited.
- Use Workflow for human approval/long-running recovery and Pipelines for bounded technical execution. Make sends, retries, callbacks, and resends idempotent.
- Axis is a backend-driven client: publish workbench metadata and secured operations; do not hardcode notification business rules in Axis.
- Every behavior change needs configuration override tests, security/failure tests, module docs, LLM contracts, regenerated context, and end-to-end validation.
