# gFramework

`gFramework` composes the core Nodics capability modules and coordinates their
runtime, clean, build, and generator lifecycles. Runtime behavior comes from the
active metadata-driven module hierarchy and layered configuration; this group
must not contain project-specific selection logic.

After ordinary init data is available, the coordinator executes the enabled,
ordered entries in the merge-friendly `mandatoryBootstrapServices` map. Each
entry names a service implementing an idempotent `reconcile(request)` contract.
Capability and project modules may add, disable, reorder, or replace reconcilers
without editing the coordinator. Reconcilers are expected
to preserve existing customizations, avoid secret generation, provide audit
traceability for mutations, and fail startup when a mandatory contract cannot be
restored safely.
