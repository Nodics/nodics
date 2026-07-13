# gframesEnvs

`gframesEnvs` groups the environment definitions for the `gframes` application. It composes environment modules such as `gframesLocal`.

Use this group for environment composition and shared environment defaults. Environment-specific values belong in child environment modules.

Keep secrets, endpoints, and runtime topology in the appropriate layered configuration rather than in framework or capability code.
