# kickoffEnvs

`kickoffEnvs` groups the environment definitions for the `kickoff` application.

Use this group for environment composition and shared environment defaults. Concrete environment values belong in child modules such as `kickoffLocal`, `kickoffDev`, `kickoffQA`, `kickoffPreProd`, and `kickoffProd`.

Environment configuration must remain layered so servers and nodes can override behavior without changing application or framework modules.
