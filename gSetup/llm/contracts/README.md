# gSetup AI Contracts

This folder contains module-specific AI/developer contracts for `gSetup`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Contract Index

- `nodics-principles.md`: compact statement of platform invariants.
- `developer-implementation-contract.md`: shared human-developer and AI-tool
  implementation rules for Nodics-native development.
- `human-maintainability-contract.md`: maintainability rules for code that
  humans and AI tools can understand, diagnose, review, test, and safely change.
- `nodics-expert-decision-contract.md`: AI decision rules for choosing the
  correct Nodics layer, artifact, extension point, and proof before coding.
- `module-structure-contract.md`: standard module, docs, and LLM folder shape.
- `documentation-impact-contract.md`: documentation updates required by behavior
  and contract changes.
- `testing-and-release-contract.md`: testing and release expectations.
- `customer-project-mode-contract.md`: scope rules for customer/project work on
  top of released Nodics.
