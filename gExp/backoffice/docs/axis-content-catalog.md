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
- every dashboard component is `AUTHENTICATED`.

The public pages permit an unauthenticated browser to obtain presentation only.
Credentials and employee recovery requests go to Profile, not CMS or
BackOffice. A valid customer account must never receive an Axis employee
session.

CMS route authorization and each target module's API authorization remain
mandatory. Hiding a component in Nodics Axis is not an authorization control.

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
5. Confirm that the three Axis routes resolve with their declared access mode.
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

## Current limitation

This change supplies and validates backend content records only. Nodics Axis
renderers, browser session behavior, Profile recovery integration, and live
dashboard module data are not implemented by this package.

The initial dashboard components intentionally contain empty placeholder
collections. They must not be presented as real operational values.

## Verification

Run:

```bash
node gExp/backoffice/test/axisContentCatalogDataContract.test.js
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
