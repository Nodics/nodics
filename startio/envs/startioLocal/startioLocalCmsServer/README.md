# startioLocalCmsServer

`startioLocalCmsServer` is the local Staged CMS authoring and approval server
for the `startio` application.

Use this module for local CMS server activation and runtime topology. CMS behavior belongs in content modules such as `cms` and `wcms`.

Local server settings should remain explicit, replaceable, and isolated from shared capability logic.

This process activates Nodics publish variants and overrides CMS business
schemas with `isVersionedEnabled: true`. Approved WCMS workflows deploy frozen
manifests through the `cmsOnline` server connection. It must use a database
separate from the Online CMS process and must not serve Online delivery as a
fallback.
