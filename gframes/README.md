# gframes

`gframes` is a project application layer. It composes `gframesModules` and `gframesEnvs` to demonstrate or host project-specific behavior above the reusable Nodics framework.

Use this application root for composition and application-level configuration. Framework behavior should remain in `gFramework`, and reusable business modules should live under the relevant module group.

Application changes should use layered configuration and active modules instead of modifying framework source.
