# kickoffModules

`kickoffModules` groups the custom capability modules for the `kickoff` application.

Use this group for project module composition and shared project-module configuration. Concrete behavior belongs in child modules such as `kickoffCore`, `kickoffInt`, and `kickoffApi`.

Project modules should extend framework capabilities through schemas, routers, services, pipelines, data, tests, and layered configuration.
