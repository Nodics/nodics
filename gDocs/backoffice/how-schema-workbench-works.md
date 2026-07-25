# How Schema Workbench Works

Schema Workbench is a governed administrative workspace for working with
business records in Nodics Axis. It allows an authorized employee to find a
business data type, understand its fields and relationships, and use only the
operations permitted by the module that owns that data.

Examples of business data types include Address, Contact, Employee, Product,
Price, Warehouse, CMS Page, and Workflow. Nodics calls the technical
definition of such a data type a **schema**.

## The idea in plain language

Without Schema Workbench, a frontend developer would have to build and
maintain a different hardcoded list and form for every data type. That creates
duplicate rules and makes customization expensive.

With Schema Workbench:

1. The backend module defines the authoritative data structure and rules.
2. Every eligible model receives generated CRUD operations by default unless
   its owning module excludes it or narrows its permitted operations.
3. Axis requests a safe description of the schema.
4. Axis uses that description to render lists, fields, relationships, and
   permitted actions.
5. Axis sends the actual operation directly to the module that owns the data.

Changing an enabled backend label or field contract can therefore update the
Axis experience without copying the same business definition into the
frontend.

## What business problem it solves

Schema Workbench provides one familiar place for common administration tasks:

- find records without learning backend API paths;
- search and review business data;
- create or update permitted records;
- understand required fields before saving;
- select an existing related record;
- create a related record when one does not exist;
- work with relationships owned by another Nodics module;
- receive the validation and security rules of the owning module.

It is not a raw database editor. Business rules, permissions, validation,
tenant isolation, audit behavior, and persistence remain controlled by Nodics.

## Current implementation status

The backend discovery contract and the first Axis Workbench experience are
implemented. The backend returns a safe description of every authorized model
schema. Axis uses that descriptor to browse schemas, search and list records,
and render a typed form for creating an independent record. The first enabled
examples are Profile **Address** and **Contact**.

Address describes a many-value Contact relationship. The implemented
relationship editor supports:

- **Select existing** — find and associate an existing Contact;
- **Create related** — create a Contact and then associate it;
- more than one Contact on the same Address.

Independent Address and Contact creation, **Select existing**, **Create
related**, recoverable multi-record draft coordination, record detail, and
generated Update and governed Delete are available.

Employees can also mark data types as favourites, return to recently used data
types, choose visible columns, save up to ten local views per data type, and
select visible records. These preferences are stored only in the browser,
scoped by employee, tenant, and enterprise. They never contain business
records, tokens, or backend authority.

## Business-user journey

An authorized employee follows this general process.

### 1. Confirm the working context

Before changing data, confirm the displayed:

- environment;
- tenant;
- enterprise;
- site or catalog when the selected capability uses them.

This prevents a valid change from being made in the wrong business context.

### 2. Open Schema Workbench

Open **Schema Workbench** from the Axis navigation. The screen shows only the
data types that:

- are eligible model schemas and are not explicitly excluded;
- are available from active modules;
- the signed-in employee is allowed to see.

Missing data types should be reported to an administrator. Employees must not
attempt to bypass the missing permission through direct API calls.

### 3. Choose a data type

Search for a readable business name such as **Address**. Technical schema keys
may be retained for diagnostics, but the normal interface should use
business-friendly names and descriptions.

### 4. Search before creating

Search for an existing record before creating a new one. This reduces
duplicates and makes relationships reusable.

For Address, useful searches may include code, city, postal code, or other
fields the owning schema marks as searchable.

### 5. Choose the permitted action

Depending on permission and schema configuration, the available actions may
include:

| Action | Business meaning |
| --- | --- |
| Search | Find matching records without changing them. |
| Read | Open a complete permitted view of one record. |
| Create | Add a new record. |
| Update | Change an existing record. |
| Delete | Remove a record only when the module permits removal. |

The absence of an action is intentional. For example, a user may be allowed
to read Address records but not delete them.

### 6. Complete required fields

Axis renders required fields, labels, allowed values, descriptions, and
read-only fields from the backend descriptor. A field marked as required must
be completed before submission.

Backend validation remains final. A form that appears complete can still be
rejected when a business invariant is not satisfied.

### 7. Handle related records

For an Address with Contacts:

1. Choose **Select existing Contact** when the Contact already exists.
2. Search and select the correct Contact.
3. If the wanted Contact is missing, choose **Create related Contact** directly
   inside the open selector.
4. Complete the Contact draft. It remains in the browser until final
   submission.
5. Return to Address and confirm the new draft association.
6. Review all related records before the final Address save.

Axis must not silently create duplicate Contacts or hide a failed related
record operation.

The standard Workbench relationship contract offers both **Select existing**
and **Create related**. **Create related** appears only when the related
model's owning module authorizes Create for the current employee. A module may
narrow the choices for an individual relationship through its `backoffice`
relationship configuration. For example, a governed reference may intentionally
offer only **Select existing**.

This behavior is generic. For example, an employee creating an Enterprise may
select an existing Tenant or create a new Tenant without leaving the
Enterprise form. The same interaction applies to every relationship whose
descriptor and target-model authorization permit nested creation.

During final submission, Axis asks the owning module to create each new related
record before creating the parent. Every successful result is immediately
replaced in the open draft by its returned reference. If a later operation
fails, the form stays open and retry resumes without recreating successful
related records.

This is a recovery contract, not a cross-module database transaction. Generic
Workbench does not delete a successfully created business record as automatic
compensation. A journey that requires all records to commit or roll back
together needs an owning backend domain operation or an explicitly
transaction-capable workflow.

### 8. Review and submit

Review the context, changed fields, and relationships. Submit the operation
only after the user confirms the intended change.

Success means the owning module accepted the operation. A frontend success
message must never be shown before the backend confirms it.

### 9. Review or update an existing record

1. Find the record in the bounded result list.
2. Choose **View** to inspect every permitted descriptor field.
3. Choose **Edit** only when it is available.
4. Change ordinary fields or relationship selections.
5. Review the current tenant and enterprise context.
6. Submit and wait for confirmation from the owning module.

Axis sends Update directly to the owning module using the record's original
primary identity as a bounded query. It does not broaden the update when an
editable identity value changes. Managed and read-only properties are not
copied into the editable model.

The current descriptor does not advertise an optimistic-concurrency
precondition. Axis therefore does not claim to detect a stale ordinary update
from timestamps alone. Revision conflict protection must first be owned and
enforced by the backend contract before a future Axis renderer can expose it.

### 10. Delete an existing record

1. Open the record through **View**.
2. Choose **Delete** only when that action is available.
3. Verify the displayed record identity, authenticated tenant, and enterprise.
4. Read the warning and explicitly confirm deletion.
5. Wait while Nodics checks declared inbound `RESTRICT` relationships.
6. If the preview is clear, confirm and wait for the owning module to accept
   or reject the request.

Axis sends exactly one bounded query using the record's original primary
identity. It never sends an empty query, never broadens the operation, and
never cascades deletion to related records. Authorization, ownership,
reference-integrity rules, and business validation remain owned by the target
module.

When deletion is rejected, the record remains selected and the confirmation
stays available with a client-safe error. While a deletion is pending, both
confirmation and cancellation are disabled to prevent duplicate submission or
ambiguous state.

If another record still uses the item, Nodics rejects deletion. For example,
an Address may still contain a Contact reference. The user should open the
Address, remove or replace that Contact, save the Address, and then retry the
Contact deletion. Axis does not silently remove the relationship or cascade
the deletion.

When an owning schema explicitly permits bulk deletion, select records on the
current page and choose **Delete selected**. Bulk actions are not enabled by
default. Nodics applies a strict maximum selection size, requires a unique
idempotency key, and executes through the same generated remove authority.
Never interpret a selected-row count as permission to bypass confirmation,
reference checks, or backend validation.

## Worked example: create an Address with Contacts

Suppose an administrator needs to create the office address `DXB-OFFICE` with
an existing telephone Contact and a new email Contact.

1. Open **Schema Workbench**, then choose **Address**.
2. Search for `DXB-OFFICE` to ensure it does not already exist.
3. Choose **Create Address**.
4. Enter the address code, type, city, state, and postal code.
5. Under Contacts, choose **Select existing** and select the telephone
   Contact.
6. Choose **Create related**, create the email Contact, and save it.
7. Confirm that both Contacts are listed on the Address draft.
8. Review the current tenant and enterprise.
9. Submit the Address.

Profile validates and persists the records. Axis coordinates the user
experience but does not become the owner of Address or Contact rules.

## When Workbench is not the right interface

Workbench is suitable for common record search and administration. A
purpose-built screen is better when the work requires a specialized business
journey, visualization, or orchestration.

Examples include:

- CMS visual page composition;
- inventory sourcing and reconciliation;
- workflow drag-and-drop design;
- staged approval and publishing;
- AI Assistant conversations;
- employee onboarding with credential and identity governance.

These screens may still reuse the same schemas and APIs, but should not force
their complete business process into a generic CRUD form.

## Employee is a protected example

Employee is intentionally not enabled by the first Workbench slice. Creating
an Employee involves identity validation, credential handling, group
assignment, and security invariants.

Axis may eventually use schema metadata to help render the experience, but
final Employee creation must call a Profile-owned domain operation. Passwords,
API keys, and hashes must never be exposed through a generic schema
descriptor.

## Developer configuration

Every eligible model receives generated Search, Read, Create, Update, and
Delete operations automatically, subject to the employee's effective access.
The module that owns a schema configures it explicitly when it needs mutations,
custom presentation metadata, relationships, or exclusion:

```js
backoffice: {
    enabled: true,
    label: 'Address',
    displayProperty: 'code',
    displayProperties: ['city', 'code'],
    operations: ['search', 'read', 'create', 'update', 'delete'],
    relationships: {
        contacts: {
            label: 'Contact methods',
            targetModule: 'profile',
            actions: ['SELECT_EXISTING', 'CREATE_RELATED']
        }
    }
}
```

The important configuration decisions are:

| Setting | Purpose |
| --- | --- |
| `enabled` | Set to `false` to exclude a model; model schemas are discoverable by default. |
| `label` | Provides a business-friendly data-type name. |
| `displayProperty` | Identifies the primary value used to recognize a record. |
| `displayProperties` | Supplies ordered identifying values for readable selectors, such as tenant description followed by tenant code. |
| `operations` | Declares which actions Workbench may offer. |
| `relationships` | Describes safe actions for related records. |
| `bulkOperations` | Explicitly enables bounded bulk actions; omitted means none. |
| `concurrency` | Selects an effective revision field for compare-and-set identity. |
| `aggregateOperations` | Delegates a named multi-record command to an owning service. |

Relationship headings describe the role on the source model rather than only
the target type. For example, both `superEnterprise` and `subEnterprises`
target Enterprise records, but should be presented as **Parent enterprise**
and **Sub-enterprises**. Define these labels on the source fields or in the
relationship presentation override.

The layered `schemaWorkbench.defaultRelationshipActions` setting supplies the
default relationship choices across schemas. Its standard value is
`SELECT_EXISTING` plus `CREATE_RELATED`. Keep relationship-specific overrides
only where the business contract needs to be more restrictive; frontend code
must not invent a relationship action that the descriptor does not advertise.

When Create or Edit is opened, Axis replaces the record-search workspace with
the form. Cancel or successful save returns the employee to search and records.
This keeps one clear task in focus and applies consistently to every model.

Nested **Create related** is bounded by the advertised relationship depth.
When a target would repeat a schema already in the current path, Axis stops
nested creation and retains **Select existing**. This prevents an accidental
cycle such as Enterprise → Parent enterprise → Parent enterprise from
rendering an unbounded form.

An owning relationship may also advertise `EDIT_RELATED`. Axis shows **Edit
related** only when the target schema independently permits Update. The update
still goes directly to the target module's generated CRUD authority; the
source relationship does not grant target-record permission.

If an owning model does not declare `displayProperties`, Workbench uses its
stable identity followed by description. Axis displays `code - description`
and limits long descriptions to five words followed by `...`. A legacy model
without code uses its configured stable identity (usually `_id`) rather than
inventing a value that could not be sent back to the owning API.
Axis exposes the complete description on pointer hover or keyboard focus even
when the visible description contains five or fewer words.
| `targetModule` | Identifies the module that owns a related schema. |
| `onTargetDelete` | On `refSchema`, `RESTRICT` prevents deletion while a source record still refers to the target. |

Configuration does not grant access by itself. Route permissions and schema
access groups still apply.

An explicit `operations` list can narrow a sensitive model to Search/Read or
another approved subset. Every operation remains filtered by the caller's
effective access and enforced again by the owning generated CRUD route.

### Developer implementation checklist

Before enabling a schema:

1. Confirm which module owns the data and business rules.
2. Check for an existing schema, CRUD router, domain operation, or descriptor.
3. Do not create a second schema loader, registry, or persistence path.
4. Decide whether generic CRUD is safe or a domain operation is required.
5. Define readable labels and descriptions.
6. Declare only the operations the business journey needs.
7. Identify same-module and cross-module relationships.
8. Decide whether each target requires explicit `RESTRICT` deletion behavior.
9. Exclude credentials, secrets, internal hashes, and operational internals.
10. Verify tenant, enterprise, and authorization behavior.
11. Test positive, negative, boundary, contract, integration, and regression
    scenarios.
12. Update business and developer documentation to match implemented behavior.

## Ownership and request flow

Axis obtains active module endpoints from BackOffice and asks each owning
module for its Schema Workbench descriptor. It then calls the owning module's
generated CRUD or domain API directly.

```text
Employee
  → Axis
  → BackOffice registry: locate the active Profile module
  → Profile: return the authorized Address descriptor
  → Axis: render the Address experience
  → Profile: execute Address or Contact operations
```

BackOffice does not proxy Address, Contact, Employee, CMS, Product, or other
business operations. nDatabase does not create a second schema authority. The
effective Nodics schema remains authoritative.

## Search, sorting, and paging

Record browsing is performed by the owning module, not by filtering the small
page already loaded in the browser. The descriptor tells Axis which text
fields may be searched, which scalar fields may be sorted, and which page
sizes are allowed. Axis waits briefly while the employee types, then sends a
bounded request. Changing the search, sort, page size, page, or selected data
type cancels an obsolete request.

Search text is treated as literal text across the advertised safe string
fields. Axis cannot send database operators. The owning module translates the
request and calls the existing generated schema service, so permissions,
ownership rules, validators, interceptors, tenant isolation, and data access
remain unchanged. The result count and page controls therefore describe the
full authorized result set, not only the records currently visible.

**Advanced filters** lets an employee choose only fields and operators
advertised by the selected data type. Conditions may be grouped with **All
conditions** or **Any condition**, including nested groups. Axis shows the
plain request preview and waits for **Apply filters** before loading data, so
an unfinished draft does not generate invalid requests. The backend limits
the condition count and nesting depth, validates values using the effective
schema type, and rejects protected fields or unsupported operators.

## Cross-module relationships

A relationship can identify a target module as well as a target schema. This
is required when related data belongs to different modules or may run on
different servers.

- Same module and same database: an eligible domain operation may use the
  framework transaction service.
- Different modules or databases: use a module-owned domain operation,
  ordered steps with compensation, or a reference-only association.
- Never describe several remote writes as one atomic transaction.

The caller must have permission on both the source and target modules. Tenant
and enterprise context must be preserved on every request.

If a related operation succeeds but a later distributed step fails, the
business process must provide an explicit retry, repair, or compensation path.
Axis must not claim that several independent module calls were one transaction.

## Security and governance

Discovery endpoints require an authenticated employee token and
`system.schema.workbench.view`. Schema access groups further restrict which
descriptors and operations the caller sees.

The Workbench contract:

- exposes authorized model schemas unless they are explicitly excluded;
- filters operations by effective access;
- excludes password and API-key material;
- preserves tenant and enterprise context;
- delegates validation and persistence to the owning module;
- keeps customer authentication separate from employee access;
- does not replace internal module-to-module or cron authentication.

## Troubleshooting

| Symptom | Likely reason | Action |
| --- | --- | --- |
| A data type is missing | It is not a model, it was explicitly excluded, its module is unavailable, or access is denied. | Check module registration, schema configuration, API exposure, and employee permission. |
| Create or Delete is missing | The caller has read-only access or the operation was not declared. | Review the schema access point and configured operations. |
| A related type cannot be loaded | The target module is unavailable or the relationship identifies the wrong owner. | Verify BackOffice discovery and `targetModule`. |
| Save is rejected | Backend validation, authorization, or a business invariant failed. | Show the safe backend message and correct the submitted data. |
| Delete says the record is referenced | Another record still uses this item. | Open the named source type, remove or replace the relationship, save, and retry. |
| Reference validation is unavailable | A declared source module/model cannot be checked safely. | Restore the source module or its governed distributed integrity provider; do not bypass the guard. |
| A partial distributed operation occurred | Independent module operations did not complete together. | Use the documented retry, repair, or compensation process. |

## Business acceptance checklist

Before a Workbench capability is released, confirm:

- business users see readable names rather than unexplained technical keys;
- the environment, tenant, and enterprise are visible;
- users can search before creating;
- unavailable actions are not displayed;
- required and read-only fields are clear;
- related records can be selected safely;
- partial failure is explained without claiming false success;
- sensitive fields are never displayed;
- audit and backend validation remain effective;
- the guide reflects the functionality actually delivered.

## Local acceptance evidence

The implemented contract was exercised in the `startioLocal` `monoServer`
topology with the real Axis client:

- employee authentication and authorized schema discovery succeeded;
- discovery returned schemas owned by the active modules rather than a
  frontend-maintained list;
- an unauthenticated discovery request was rejected;
- bounded record search succeeded and an unsupported raw-query operator was
  rejected;
- create, update, and delete actions were shown only from advertised
  operations;
- Enterprise relationships appeared as **Tenant**, **Parent enterprise**, and
  **Sub-enterprises**;
- related Tenant choices appeared as `code - description`, limited to five
  description words, with the full description available as a tooltip;
- the acceptance journey did not create, update, or delete business data.

Automated contracts additionally cover protected-field handling, permission
filtering, bounded filters, relationship cycles and depth, delete-impact
inspection, tenant forwarding, bulk limits, aggregate delegation, revision
forwarding, and fail-closed behavior when required revision metadata is
missing.

## Continue

- [How To Read The Nodics Axis Workspace Context](how-to-use-axis-workspace-context.md)
- [BackOffice Browser Security](../security/backoffice-browser-security.md)
- [How Users, Tenants, And Permissions Work](../security/how-users-tenants-and-permissions-work.md)
- [Database module documentation](../../gFramework/nDatabase/database/README.md)
