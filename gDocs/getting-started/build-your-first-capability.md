# Build Your First Nodics Capability

This journey is for someone who understands basic programming but is new to
Nodics. It explains the whole path before asking you to learn each internal
detail.

## What You Will Build

Imagine that a business needs to keep a list of service requests. A user should
be able to create a request, view it, update it, and close it. Different
customers must not accidentally access each other's information.

In Nodics, this business idea becomes one owned **capability**. A capability is
a coherent piece of business behavior with one clear home.

## The Five Pieces In Plain Language

| Nodics term | Plain-language meaning |
| --- | --- |
| Module | The home that owns the capability. |
| Schema | The agreed shape and rules for the information. |
| Service | The business behavior performed on that information. |
| Route/API | The controlled doorway used by another application. |
| Test | Executable evidence that the behavior and its boundaries work. |

You may later use controllers, facades, pipelines, events, or providers. Do not
add them merely because they exist. Add a layer when it owns a clear
responsibility.

## Step 1: Confirm The Capability Owner

Search the [Module Documentation Index](../reference/module-documentation-index.md)
and [Complete Module Catalog](../reference/module-catalog.md). Extend an
existing capability when it already owns the behavior. Create a new project
module only when the business capability is genuinely new.

Do not place customer behavior in a reusable framework module. Nodics framework
modules supply defaults; project modules own project behavior and overrides.

## Step 2: Describe The Contract Before Coding

Write down:

- the information the service request contains;
- who may create, read, update, or close it;
- which tenant owns it;
- valid and invalid states;
- whether another module or external system is involved;
- how success and failure will be observed;
- which behavior a customer may customize.

This short description prevents the API, data model, and permissions from
becoming separate guesses.

## Step 3: Put Each Concern In Its Owned Layer

Use [How To Create Application Functionality](../development/how-to-create-application-functionality.md)
for the detailed workflow. In summary:

1. Define data rules in the owning module's schema definitions.
2. Define business behavior in its service layer.
3. Expose only the required API operations through route definitions.
4. Configure permissions and tenant behavior explicitly.
5. Use layered `properties.js` configuration for policy that projects or
   environments may change.
6. Keep generated files generated from their source definitions.

## Step 4: Verify More Than The Happy Path

Test:

- a valid service request;
- missing or invalid information;
- a user without permission;
- access from the wrong tenant;
- state boundaries, such as closing an already closed request;
- project-level customization;
- the API and generated contract;
- integration with any module or provider involved.

Follow [How To Test Nodics Changes](../testing/how-to-test-nodics-changes.md)
for the available test and generation commands.

## Step 5: Make The Capability Discoverable

Update the owning module README with purpose, ownership, configuration,
extension points, security, and verification. Update `gDocs` when users need a
new task guide. Update AI/developer contracts when the implementation rule or
extension boundary changes.

## What Success Looks Like

A new developer should be able to answer all of these without reading every
source file:

- What business problem does the capability solve?
- Which module owns it?
- Which API and data contract does it expose?
- Who may use it?
- How is tenant separation preserved?
- How may a project customize it?
- Which tests prove it?
- What must be regenerated after a change?

## Continue

- Previous: [How To Set Up Nodics](how-to-setup-nodics.md)
- Next: [How To Create Application Functionality](../development/how-to-create-application-functionality.md)
- Terminology: [Nodics Glossary](../reference/glossary.md)
- Documentation home: [Nodics Documentation](../README.md)
