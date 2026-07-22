# Security Shared-Responsibility Model

This guide helps business owners, project teams, platform operators, providers,
and auditors agree who must protect what. A secure framework cannot compensate
for missing production secrets, open networks, unprotected backups, or absent
operational ownership.

## Beginner View

Think of Nodics as a secure building design.

- Nodics supplies doors, locks, room boundaries, access rules, alarms, and
  inspection points.
- The project decides who receives access and how the building is customized.
- Infrastructure operates the site, network, keys, backups, and monitoring.
- The business decides which information is sensitive and which rules apply.

Every layer must do its part.

## Responsibility Matrix

| Area | Nodics framework | Customer/project | Infrastructure/provider | Business/security organization |
| --- | --- | --- | --- | --- |
| Identity model | Human, service, API-key, permission, group, tenant, and token contracts | Connect selected IAM/CIAM and define project identities | Protect identity-provider availability and transport | Approve identity lifecycle and access policy |
| Authorization | Route permissions, token-type boundaries, service checks | Assign least-privilege roles and project permissions | Enforce gateway/mesh identity where selected | Approve roles, segregation of duties, reviews |
| Tenant isolation | Tenant-aware route, service, data, cache, search, job, import, and event contracts | Choose tenant model and prove custom code preserves it | Provide isolated storage/network where required | Classify customers and residency requirements |
| Secrets | Governed secret inputs, insecure-default rejection, redaction | Supply and rotate real secrets outside source control | Operate secret manager/KMS/HSM if selected | Set rotation and emergency-access policy |
| API security | Authentication pipeline, permissions, exposure gates, CORS, headers, limits, rate policy | Enable only required API categories and origins | TLS, WAF, gateway, DDoS, certificate lifecycle | Define external exposure and abuse objectives |
| Data protection | Validation, exact ownership, access policy, safe projections | Classify fields and add project-specific controls | Encryption at rest/in transit, storage access, backup protection | Retention, deletion, privacy, legal basis |
| Runtime change | Preview, approval, activation, audit, rollback capabilities | Configure approvers and protected environments | Preserve audit storage and deployment separation | Define change authority and emergency process |
| Logging/diagnostics | Central redaction and sanitized diagnostic contracts | Avoid logging project secrets or sensitive payloads | Secure collection, retention, access, alerting | Approve retention and investigation access |
| Resilience | Bounded retry, circuit, readiness, cache and topology contracts | Select policies for business criticality | Operate redundant providers and capacity | Define SLO, RTO, RPO, crisis priorities |
| Testing/release | Security, route, tenant, topology, generated, and release gates | Add project and customer-specific misuse tests | Run gates in controlled CI/CD | Approve acceptance evidence and exceptions |
| Vulnerabilities | Dependency ownership and supported runtime contract | Track project dependencies and remediation | Patch hosts, images, databases, brokers, gateways | Set risk acceptance and disclosure process |
| Compliance | Evidence-producing capabilities | Configure solution-specific controls | Supply provider attestations | Own legal interpretation and certification |

## Required Production Decisions

Before production, record owners and evidence for:

1. Identity provider and break-glass administration.
2. Secret source, rotation, revocation, and recovery.
3. Public, partner, internal, and administration network boundaries.
4. Tenant placement and any dedicated database, search, cache, or messaging
   requirements.
5. TLS termination and trust between gateway, servers, and modules.
6. Log, audit, and security-event retention.
7. Backup encryption, restore testing, RTO, and RPO.
8. Dependency and container/host patching.
9. Vulnerability reporting, triage, remediation, and disclosure.
10. Release approval, rollback authority, and emergency change.
11. Incident detection, containment, evidence preservation, and notification.
12. Provider qualification and failure behavior.

## Fail-Safe Configuration Rules

- Do not enable insecure compatibility flags in production-like environments.
- Do not use local sample credentials or source-controlled secrets.
- Do not make an internal route public to solve connectivity.
- Do not allow cache fallback for authoritative security state.
- Do not trust forwarded headers until the proxy boundary is explicitly
  configured and tested.
- Do not treat a successful gateway check as authorization for every module.
- Do not expose test, file, dynamic-runtime, or diagnostic APIs unless that
  topology requires them.
- Do not log bearer handles, passwords, API keys, cookies, credentials, or
  confidential business payloads.
- Do not claim a provider is production-ready without live qualification in
  the intended topology.

## Operational Review Cadence

| Frequency | Review |
| --- | --- |
| Every release | Dependency changes, route exposure, permissions, generated contracts, security tests, rollback plan |
| Monthly or risk-based | Privileged access, inactive accounts, secret age, provider health, alert quality |
| Quarterly or policy-defined | Tenant isolation evidence, restore exercise, incident exercise, provider and runtime maturity |
| After an incident or major change | Threat assumptions, access paths, logs, detection gaps, recovery evidence, documentation |

## Acceptance Record Template

```text
Business/service:
Data classification:
Tenant model:
Public APIs:
Administrative APIs:
Identity provider:
Secret provider:
Selected database/cache/search/message providers:
Security and audit owners:
RTO / RPO:
Required regulations or contractual controls:
Evidence reviewed:
Known gaps and compensating controls:
Risk acceptance owner and expiry:
```

## Continue

- Business overview: [Why Businesses Can Trust Nodics](../business/security-and-trust.md)
- Technical foundations: [How Users, Tenants, And Permissions Work](how-users-tenants-and-permissions-work.md)
- Evidence and tests: [Security Evidence Guide](security-evidence-guide.md)
- Deployment: [How To Prepare For Deployment](../operations/how-to-prepare-for-deployment.md)
- Production model: [Production Operating Model](../operations/production-operating-model.md)
