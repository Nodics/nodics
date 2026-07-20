# Nodics Glossary

This glossary gives business readers, beginners, experienced developers, and AI
tools one shared meaning for important Nodics terms.

| Term | Plain-language meaning |
| --- | --- |
| Application factory | A platform that supplies a governed structure for repeatedly building and evolving applications, not only a library of utility code. |
| Capability | A stable business or platform responsibility, such as authentication, scheduled jobs, search, or catalog management. |
| Implementation | The code or provider that performs a capability. Implementations may change while the capability contract remains stable. |
| Module | The ownership boundary for a capability, configuration contribution, environment, server, node, or project layer. |
| Group module | A module that organizes related child modules and their shared meaning. It may have little or no runtime source of its own. |
| Project module | A module that owns application-specific behavior or customization built on Nodics. |
| Framework module | A reusable Nodics module that provides a default platform capability. |
| Environment | Configuration and composition for a deployment stage or operating context. Environment names are project-defined, not hardcoded framework policy. |
| Server | A deployable composition of active modules. It is not the primary ownership boundary for business capabilities. |
| Node | One running instance within a server topology. |
| Tenant | An organization or customer context whose data, configuration, and access decisions must remain isolated as defined by the application contract. |
| Layered override | A later project, environment, server, node, tenant, or runtime contribution that customizes an earlier default through a governed extension point. |
| Schema | The structure, rules, access behavior, and supporting metadata for a kind of data. |
| Route | An API operation that accepts a controlled request and maps it into Nodics processing. |
| Controller | The boundary that translates request data into application context and a response. |
| Facade | An orchestration boundary that coordinates capability calls without placing that coordination in a controller. |
| Service | The layer that owns reusable business or application behavior. |
| Pipeline | An ordered lifecycle of processing steps whose nodes can be extended or overridden. |
| Provider | A replaceable implementation for infrastructure or external behavior such as cache, database, messaging, or search. |
| Runtime governance | Controlled configuration behavior that includes validation, preview, activation, audit, cleanup, and rollback where supported. |
| Generated artifact | Output created from authoritative source definitions. It must be regenerated, not treated as hand-maintained authority. |
| Consolidated topology | Several active modules running together in a simpler deployment composition. |
| Modular topology | Active modules distributed across independently composed processes or deployment units. |
| Human authentication | A person's login and identity flow. It remains separate from module-to-module and scheduled-process credentials. |
| Internal communication | Authenticated module-to-module access using platform service identity and contracts rather than a person's username and password. |
| Production-ready | Implemented and supported by sufficient contract, security, operational, and test evidence for its stated scope. Production suitability still depends on the target workload. |
| Guarded | Implemented but intentionally restricted by policy or requiring explicit qualification before production use. |
| Sample/reference | An example that demonstrates an extension pattern and is not a production claim. |
| Scaffolded | A discoverable module or extension boundary whose full runtime behavior is not yet complete. |
| Parked | Intentionally retained for later work and not presented as currently usable functionality. |

## Canonical Status Language

Use the maturity terms above consistently. If another document uses words such
as *implemented*, *limited*, or *provider-dependent*, translate them into the
more precise maturity statement in the
[Provider And Capability Maturity Matrix](provider-capability-maturity-matrix.md).
That matrix remains authoritative for current provider and capability status.

## Continue

- Documentation home: [Nodics Documentation](../README.md)
- Module ownership: [Module Documentation Index](module-documentation-index.md)
- Platform structure: [How Nodics Is Organized](../architecture/how-nodics-is-organized.md)
