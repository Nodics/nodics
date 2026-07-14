# modules

`modules` groups the custom capability modules for the `startio` application.

Use this group for project module composition and shared project-module configuration. Concrete behavior belongs in child modules such as `startioCore`, `startioInt`, and `startioApi`.

Project modules should extend framework capabilities through schemas, routers, services, pipelines, data, tests, and layered configuration.
