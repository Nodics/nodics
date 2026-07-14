# envs

`envs` groups the environment definitions for the `startio` application.

Use this group for environment composition and shared environment defaults. Concrete environment values belong in child modules such as `startioLocal`, `startioDev`, `startioQA`, `startioPreProd`, and `startioProd`.

Environment configuration must remain layered so servers and nodes can override behavior without changing application or framework modules.
