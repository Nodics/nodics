# How To Read The Nodics Axis Workspace Context

## Who this guide is for

This guide is for business users, BackOffice administrators, operators, and
partner developers using the implemented Nodics Axis dashboard.

Axis is the employee-only BackOffice application. It is not a customer
storefront. The context bar tells an employee which governed business and
content scope they are currently viewing before they start an operation.

## What the context labels mean

| Label | Plain-language meaning | Example |
| --- | --- | --- |
| Environment | The deployed Nodics environment serving this Axis application. | `Startio Local` |
| Tenant | The isolated organization or platform partition that owns the current data boundary. | `Default` |
| Enterprise | The business organization currently being administered inside the tenant. | `Default` |
| Site | The CMS Site that resolves the current Axis pages and experience. | `Axis CMS Site` |
| Catalog | The content catalog containing the current Axis pages and components. | `Axis Content Catalog` |

Axis converts technical identifiers such as `startioLocal` and
`axisContentCatalog` into readable labels for display. This presentation change
does not rename, rewrite, or replace the backend identifier. API requests,
authorization checks, cache keys, audit records, and tenant isolation continue
to use the exact backend-provided code.

## Business-user workflow

1. Sign in with an authorized employee account.
2. Read all five context labels before opening a business module.
3. Confirm that the Tenant and Enterprise match the business you intend to
   administer.
4. Confirm that Site and Catalog match the content experience you intend to
   view or change.
5. Open only an enabled module from the left navigation.

For the current implementation, the context bar is informational. It is not a
tenant, enterprise, Site, or Catalog switcher. A future selector must use a
governed backend context-switching contract; changing visible browser text
must never change authority.

## Expected and rejected behavior

### Successful

An authorized employee opens the dashboard and sees readable context such as
`Environment: Startio Local` and `Site: Axis CMS Site`. Axis still sends the
original codes supplied by BackOffice and CMS when it calls backend APIs.

### Unauthorized

A hidden or disabled navigation entry does not grant or deny access. Every
backend module independently authorizes the employee and tenant when an API is
called.

### Boundary

Long translated labels may wrap or truncate through an accessible responsive
presentation, but the underlying identifiers remain unchanged. At tablet and
mobile widths, the context remains readable without horizontal page overflow.

### Failure and recovery

If BackOffice or CMS cannot provide a validated context, Axis shows a recovery
state instead of inventing a tenant, enterprise, Site, or Catalog. Retry uses
the same authoritative bootstrap or CMS delivery contract.

## Administrator and operator guidance

- Maintain tenant and enterprise identity through Profile-owned contracts.
- Maintain Axis Site, Catalog, pages, and components through the BackOffice
  core-data contribution and CMS-owned schemas.
- Do not edit the Axis frontend to change an authoritative code.
- Do not treat a friendly label as proof of authorization.
- Investigate an unexpected context by checking authenticated BackOffice
  bootstrap, CMS delivery, and the employee's tenant and permissions.

## Partner developer guidance

Axis presentation may humanize a validated identifier for readability, but
must retain the raw value separately. A display-name helper must:

- operate only after the backend contract has been validated;
- preserve common technical acronyms such as AI, API, CMS, ID, and UI;
- never mutate request payloads, query keys, authorization context, storage
  keys, audit data, or telemetry dimensions;
- remain generic and must not contain project-specific identifier mappings;
- allow a future backend-provided localized display name to take precedence.

Backend modules remain the authority for explicit business names and
translations. Identifier humanization is only a safe fallback for presentation.

## Authentication-screen behavior

On desktop and tablet widths at or above the medium breakpoint, login,
password recovery, and lock screens use a 60-percent dark brand panel and a
40-percent light interaction panel. Below that breakpoint, the decorative
brand panel is hidden and the complete employee journey uses one full-width
column. The responsive change must not remove form labels, assistance, legal
content, keyboard access, or screen-reader information.

## Verification

Frontend contributors run `npm run verify` in the Nodics Axis repository.
Acceptance covers readable labels, preservation of raw identifiers, the
60/40 desktop split, single-column mobile behavior, keyboard accessibility,
and absence of horizontal overflow.

Backend contributors run the BackOffice, CMS, Profile, cache, and topology
contracts through the standard Nodics test suites. Browser presentation is not
a replacement for backend tenant isolation or authorization tests.

## Continue

- [BackOffice Browser Security](../security/backoffice-browser-security.md)
- [How Users, Tenants, And Permissions Work](../security/how-users-tenants-and-permissions-work.md)
- [How Cache Works](../platform/how-cache-works.md)
- [BackOffice module documentation](../../gExp/backoffice/README.md)
