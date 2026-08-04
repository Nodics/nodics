# complianceCore Agents

Follow the root Nodics AI contract: `../../AGENTS.md`.
Follow global AI/development guidance: `../../gSetup/llm/README.md`.
Follow Nodics structure, layering, override, documentation, and test contracts inside this boundary.

- Own only compliance-wide subject/scope resolution, bounded terminology,
  masking, authorization, retention/legal-hold helpers, and the shared
  Compliance Management navigation root.
- Keep domain lifecycles in sibling capabilities such as KYC. Do not create
  complianceCore copies of KYC cases, checks, decisions, providers, or policy.
- Resolve tenant and enterprise scope from authenticated context and fail
  closed on caller-supplied scope conflicts.
- Later project/customer modules may replace services and configuration through
  normal Nodics layering, but must preserve isolation and safe projections.
