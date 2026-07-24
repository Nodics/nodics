# Axis Content Catalog

## What this capability provides

The BackOffice module contributes the initial content records used to compose
Nodics Axis pages. Nodics Axis is an employee-only business administration
application. Customers may be managed as business data, but customer accounts
cannot use Axis.

The implemented core package creates:

- `axisContentCatalog`;
- `axisCmsSite`;
- the public `/login` employee sign-in page;
- the public `/forgot-password` employee recovery page;
- the authenticated `/dashboard` employee page;
- the authenticated `/lock-screen` employee re-verification page;
- two page templates and their named slots;
- declarative page and component type contracts;
- logical renderer mappings;
- client-safe component properties; and
- ordered page-to-component relationships.

This package contains no React code, authentication logic, API credentials,
endpoint URLs, executable HTML, or business operations.

## Ownership

BackOffice owns the Axis-specific reference records because they package the
BackOffice experience. Existing Nodics capabilities remain authoritative:

| Concern | Authority |
| --- | --- |
| Catalog schema and persistence | nCatalog |
| CMS sites, pages, templates, slots, components, routes, and delivery | CMS |
| Core-data execution, diagnostics, and history | nData import |
| Employee authentication and recovery | Profile |
| Module discovery and Axis bootstrap | BackOffice |
| Rendering, interaction, accessibility, and responsive behavior | Nodics Axis |

Do not copy these schemas or create a BackOffice content loader. Project modules
customize the records through later layered core-data contributions.

## Security model

Public visibility is explicit and minimal:

- `/login` is `PUBLIC`;
- `/forgot-password` is `PUBLIC`;
- every component referenced by either public page is `PUBLIC`;
- `/dashboard` is `AUTHENTICATED`; and
- every dashboard component is `AUTHENTICATED`;
- `/lock-screen` is `AUTHENTICATED`; and
- every lock-screen component is `AUTHENTICATED`.

The authentication template uses a responsive split layout. On desktop, the
`showcase` slot provides the left-side Nodics narrative while `brand`,
`introduction`, `authentication`, `assistance`, and `legal` remain independent
right-side content segments. On mobile webviews, the showcase panel is hidden
and the employee form becomes the primary single-column experience. Content
editors may change approved text and highlights, but cannot change the trusted
Axis renderer implementation or inject executable presentation code.

The public pages permit an unauthenticated browser to obtain presentation only.
Credentials and future employee recovery requests go to Profile, not CMS or
BackOffice. The current recovery page does not claim to send instructions
because Profile does not yet expose an approved employee self-recovery
contract. A valid customer account must never receive an Axis employee session.

CMS route authorization and each target module's API authorization remain
mandatory. Hiding a component in Nodics Axis is not an authorization control.

## Public Axis bootstrap

Before an employee has a token, Axis calls
`GET /nodics/backoffice/v0/bootstrap/public`. This endpoint returns only the
currently observed client-callable Profile and CMS endpoints, Axis CMS
composition identifiers, locale, channel, fallback mode, and contract version.

It does not return module inventory, instance identifiers, server or node
coordinates, lease timestamps, health details, permissions, secrets, or
credentials. BackOffice derives the two endpoints from active module
self-registration, so this does not create a manually maintained endpoint
authority.

The endpoint fails closed when Profile or CMS is not actively registered, the
client contract version is unsupported, or public bootstrap is disabled.
Projects may override `backofficeRegistry.publicBootstrap` through normal
configuration layering while preserving the low-disclosure contract.

After employee authentication, Axis calls the existing secured
`GET /nodics/backoffice/v0/bootstrap` endpoint with the human bearer token.
That response remains permission-filtered and separate from public discovery.

## Importing the records

These records live under `gExp/backoffice/data/core`. They are intentionally
imported through the existing nData core-import operation and are not written
when BackOffice starts.

For local development:

1. Start a Nodics runtime containing nCatalog, CMS, nData import, Profile, and
   BackOffice.
2. Authenticate as an employee allowed to execute the governed core import.
3. Invoke the standard core-import operation with `backoffice` in the selected
   module list and the intended tenant context.
4. Inspect the import-run result and history for rejected or skipped records.
5. Confirm that the four Axis routes resolve with their declared access mode.
6. Start Nodics Axis only after the core import succeeds.

The headers use `saveAll` and stable `code` queries so repeated imports use the
standard idempotent import path instead of creating duplicate identities.
The import-run fingerprint also prevents an unchanged completed core package
from being dispatched again. A second identical request therefore succeeds
without adding another catalog, page, component, relationship, or completed
run-history record.

Starting or restarting `monoServer` does not execute this package. Existing
Axis records remain unchanged until an authorized operator explicitly invokes
the core-import operation again. This separation is intentional: module
startup registers runtime capability state, while nData import remains the
only authority that creates the Axis CMS reference data.

Current local development deliberately uses records marked `ONLINE` while CMS
publication mode is disabled. This is not a second publisher. Staged approval
and nPublish integration remain deferred until the basic Axis composition and
renderers are implemented.

## Customizing content

A project may contribute later records with the same stable codes to refine
labels, messages, templates, slots, component order, or approved renderer
contracts. Preserve these rules:

- renderer values are logical keys, never URLs or executable module paths;
- component properties contain client-safe presentation data only;
- Profile endpoints, credentials, secrets, permission decisions, and workflow
  behavior never belong in content;
- a public page may contain only public components;
- post-login pages and components remain authenticated; and
- customer-facing functionality belongs to the customer application, not Axis.

## Employee idle and lock policy

After authentication, the secured BackOffice bootstrap includes
`axisPolicy`. Version 1 contains only implemented client behavior:

- `screenLockEnabled`;
- `idleTimeoutSeconds`;
- `contractVersion`;
- optimistic `revision`; and
- `source`, which is `DEFAULT` or `PERSISTED`.

The layered fail-safe default is configured under
`properties.js#backofficeAxisPolicy`. Tenant-scoped operator changes are stored
in the private `backofficeAxisPolicy` schema. Axis does not read that schema
directly. BackOffice resolves the effective value and returns a client-safe
projection through `/bootstrap`.

Authorized operators can inspect or update the policy through:

```text
GET /nodics/backoffice/v0/axis/policy
PUT /nodics/backoffice/v0/axis/policy
```

An update requires `backoffice.axis.policy.update`, a human principal, and the
current `expectedRevision`. The initial persistent write expects revision `0`.
Later writes compare and advance the stored revision. Values below 60 seconds
or above 86,400 seconds are rejected. Service tokens cannot perform the human
operator update.

Example:

```json
{
  "screenLockEnabled": true,
  "idleTimeoutSeconds": 900,
  "expectedRevision": 0
}
```

If the persistent store cannot be read, BackOffice returns the configured safe
default rather than disabling screen lock. Operators should still investigate
the logged persistence failure because their latest override may not be active.

Axis observes browser activity, locks the presentation when the effective
deadline is reached, and uses the authenticated `/lock-screen` CMS page. The
password is submitted directly to Profile for re-authentication and is never
stored. Unlock obtains a fresh in-memory employee session and refreshes the
authorized bootstrap policy before returning to the prior protected route.
Choosing “Not you? Sign out” invokes Profile logout and returns to employee
login.

This is a presentation lock, not an authorization substitute. Target modules
continue validating every bearer token, and token expiry or revocation still
requires a normal login.

## Current limitations

Profile employee self-recovery integration and live dashboard module data are
not implemented. Recovery content and rendering exist, but the submit action
must remain unavailable until Profile owns an approved anti-enumeration,
rate-limited recovery contract.

The initial dashboard components intentionally contain empty placeholder
collections. They must not be presented as real operational values.

## Verification

Run:

```bash
node gExp/backoffice/test/axisContentCatalogDataContract.test.js
node gExp/backoffice/test/backofficeAxisPolicyService.test.js
node gContent/cms/test/cmsContentDeliveryContract.test.js
node gFramework/nData/nImport/import/test/systemCoreSampleDataCatalog.test.js
npm run test:import
```

The focused contract validates catalog ownership, renderer mappings, template
and slot references, component types, route access, public composition safety,
dashboard authentication, non-executable properties, stable idempotent header
queries, and required record relationships.

The local lifecycle acceptance also covers a clean database, zero Axis records
after monoServer startup, one explicit BackOffice core import, an unchanged
second import, successful public login and recovery delivery, anonymous
dashboard rejection, authenticated employee dashboard delivery, and an
unchanged record set after runtime restart.
