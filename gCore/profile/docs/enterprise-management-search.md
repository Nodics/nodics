# Enterprise Management Search and Confirmed Creation

## What This Capability Does

Enterprise search gives an authorized employee a safe way to find enterprise
records for administrative work. Typical examples are selecting an enterprise
before creating related data, confirming whether an enterprise is active, or
asking Axis Assistant to find an enterprise by code.

Profile remains the business, validation, authorization, and persistence
owner. BackOffice supplies current contract discovery, while Assistant supplies
conversation and governed tool orchestration. Neither stores a second
enterprise list.

Confirmed creation is exposed separately at `POST
/nodics/profile/v0/enterprises`. It requires a human access token,
`profile.enterprise.create`, bounded input, and an idempotency key. Profile
checks duplicate code and uses the generated `DefaultEnterpriseService`; an AI
module never writes the enterprise collection directly. Axis Assistant first
creates and approves an immutable confirmation, then calls Profile or hands
the approved work to Workflow.

## Before You Start

The caller must:

1. authenticate through the Profile employee login flow;
2. receive a human `access` token;
3. belong to a group that resolves `profile.enterprise.search` for search and
   `profile.enterprise.create` for creation;
4. send the bearer token through the normal Nodics request pipeline.

Customer, service, module, and cron credentials are not accepted. The default
bootstrap grants the permission to `runtimeConfigAdminUserGroup`; projects
should grant it only to employee groups that genuinely need cross-enterprise
administration.

## Business User Workflow

An authorized employee may search without filters to receive the first bounded
page, or use exact filters:

```text
GET /nodics/profile/v0/enterprises/search?code=default
GET /nodics/profile/v0/enterprises/search?name=Default%20Enterprise&active=true
GET /nodics/profile/v0/enterprises/search?page=2&limit=25
```

The result contains `page`, `limit`, `count`, and `items`. Each item may contain
the configured safe fields such as enterprise code, name, active state, tenant
code, parent-enterprise code, and timestamps.

Expected rejected journeys include an employee without the permission, a
customer or service credential, an unknown/operator filter, an invalid active
value, or pagination beyond the configured boundary. Correct the credential,
permission, or filter and retry. There is no partial write or rollback because
this operation is read-only.

## Axis Assistant Workflow

The inactive OOTB `axisAssistantReadOnly` policy allowlists the logical tool
`profile.enterprise.search`. A project or local environment may activate a
reviewed layered policy. At execution time:

1. Assistant loads the employee-filtered BackOffice bootstrap;
2. it resolves operation `profile_searchenterprises` from the current Profile
   OpenAPI observation;
3. it verifies read-only method and permission stability;
4. it forwards the employee bearer and scalar arguments to Profile;
5. Profile performs final authentication, authorization, validation, querying,
   and projection;
6. Assistant applies its own top-level result-field allowlist before the data
   enters model context.

Model output cannot choose a URL, HTTP method, credential, permission result, or
unapproved response field.

For confirmed creation, the employee first selects an existing unassigned
tenant or completes the separately governed tenant-creation process. An
enterprise owns one tenant under the current Profile schema, so attempting to
associate a tenant that already belongs to another enterprise is rejected by
the Profile management service before persistence and remains protected by the
authoritative unique tenant database contract. The enterprise record itself is
stored through Profile's configured default enterprise store; `tenantCode` is
the business association and must not be used as a second database-model
selection path.

Axis Assistant binds the operation, arguments, employee, tenant context,
expiry, revision, and idempotency key into `assistantConfirmation`. Changed
arguments or replay return conflict, expired confirmations return gone, and
unsupported mutations return bad request. Direct execution forwards the human
bearer to Profile. When `workflowCode` is selected, Assistant creates an active
Workflow item and returns a durable carrier code; Workflow, not Assistant,
owns all later manual or automatic actions.

## Configuration

Layer the smallest required fragment instead of copying Profile:

```js
module.exports = {
    enterpriseManagement: {
        search: {
            defaultResultCount: 25,
            maximumResultCount: 100,
            maximumPageNumber: 10000,
            maximumCodeLength: 128,
            maximumNameLength: 256,
            projectedFields: ['code', 'name', 'active', 'tenant', 'updatedAt']
        }
    }
};
```

Smaller result bounds or a smaller projection are safe customizations. Adding a
field requires a disclosure review and tests. Do not add credentials, contacts,
addresses, unrestricted metadata, or recursive references.

## Architecture And Data Contract

The router delegates to `DefaultEnterpriseManagementController`, then
`DefaultEnterpriseManagementFacade`, then
`DefaultEnterpriseManagementService`. The service calls the existing generated
`DefaultEnterpriseService` with the configured default enterprise tenant,
caller authentication evidence, exact filters, `recursive: false`, stable code
sorting, and bounded pagination.

The enterprise schema and generated service remain authoritative. This design
does not use nSearch or Elasticsearch because the implemented filters are
bounded exact database queries and Profile search indexing is not enabled. If a
future measured requirement needs full-text search, extend the existing nSearch
authority rather than adding a second index.

## Security, Operations, And Performance

- Apply gateway and module rate limits appropriate to administrative users.
- Audit authentication and authorization outcomes without logging returned
  enterprise data or bearer tokens.
- Monitor latency, stable error code, and result count with fixed-cardinality
  metrics; do not label metrics with enterprise names or employee identifiers.
- Keep `maximumResultCount` aligned with response-size and database objectives.
- Deploy Profile in monoServer or a separate Profile server without changing
  the contract. BackOffice and Assistant do not become runtime authorities.
- Back up and restore enterprise records through existing Profile/database
  procedures. This read-only projection introduces no migration or duplicate
  state.

## Partner Extension Example

A partner that needs a non-sensitive `regionCode` may add it to the enterprise
schema through the normal later module layer, add it to layered
`projectedFields`, update the disclosure documentation, and extend the focused
projection test. The partner must not copy the enterprise model, create an
Assistant-owned enterprise collection, or bypass Profile permissions.

## Verification

```text
node gCore/profile/test/enterpriseManagementSearchContract.test.js
node gAi/aiAssistant/test/aiAssistantGovernedReadToolContract.test.js
node gAi/aiAssistant/test/aiAssistantConfirmationAndWorkflowContract.test.js
npm run test:profile
npm run llm:generate
npm run llm:validate
```

The focused contract proves positive filtering, default-tenant authority,
human-only access, unsafe-query rejection, pagination boundaries, sensitive
field exclusion, and matching OOTB/local Assistant tool identities.
