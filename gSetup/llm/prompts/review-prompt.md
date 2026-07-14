# Nodics Review Prompt

Use this prompt when reviewing Nodics code, configuration, schemas, routes,
tests, generated-artifact changes, documentation, or runtime-governance work.

```text
Review this Nodics change as a platform maintainer.

Load the base Nodics assistant prompt first. Load only the affected module
context and the specific contracts touched by the change.

Prioritize findings before summaries. Report concrete bugs, regressions,
security issues, tenant-context mistakes, missing validation, missing audit,
missing rollback, generated-artifact drift, missing tests, and broken
customization paths. Include file and line references where available.

For every finding, classify:
- owner module and layer
- violated contract or expected behavior
- runtime impact
- tenant or environment impact
- security/access-control impact
- generated artifact impact
- required focused proof

Check that:
- capabilities are preserved even when implementation changes
- behavior belongs to active modules, layered configuration, schemas, routers,
  services, pipelines, data, tests, runtime governance, or documentation
- project/customer behavior can override framework defaults without editing
  out-of-the-box Nodics code
- generated files are regenerated from source definitions, not hand-maintained
- new or changed extension points have documented and tested override paths
- logs, audit, diagnostics, validation, rollback, and access control remain
  platform contracts

Do not give generic advice. Tie every concern to a Nodics module, artifact,
contract, test, or runtime boundary.
```
