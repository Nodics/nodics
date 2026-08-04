# Compliance and KYC

This capability family under `gCompliance` is the single Nodics authority for identity-verification state. `complianceCore` owns shared compliance governance and the Axis section root; Profile owns identities, nMedia owns private files, Workflow owns long-running review, nPipeline owns deterministic steps, Notify owns verification messages, and provider adapters translate external protocols. Axis is a presentation client.

The production-ready first slice covers individual `CUSTOMER` and `EMPLOYEE` KYC across onboarding, checkout, payment, refund, and order entry points. KYB, AML, sanctions, adverse-media, and ongoing-monitoring capabilities are extension contracts only until their owning modules and provider evidence are implemented and verified.

Start with `kycCore/README.md`, `kycCore/llm/contracts/kyc-compliance-contract.md`, and the canonical Compliance and KYC guide. Run `npx mocha gCompliance/kyc/kycCore/test/*.test.js`, then generated-context and structure validation after changes.
