# How Nodics Compares With Other Approaches

This comparison is intended to support a decision, not to declare one tool the
winner in every situation. Products in each category vary, and their features
change. Confirm current product capabilities with the relevant vendor or
project before making a purchase or architecture decision.

## Comparison By Approach

| Decision area | Nodics | Minimal web/API framework | Low-code platform | Large opinionated enterprise platform | Independently built microservices |
| --- | --- | --- | --- | --- | --- |
| First prototype | More structure to learn | Often fastest for a small coded prototype | Often fastest for supported workflows | Setup can be substantial | Usually slower because platform decisions are repeated. |
| Path beyond the prototype | Architecture, extension, testing, and topology contracts are built into the model | The team must select and govern many supporting patterns | Depends on platform limits and escape paths | Strong where the product model fits | Flexible, but consistency must be designed and operated. |
| Business capability ownership | Explicit module ownership | Determined by each project | Often modeled through platform applications or flows | Usually defined by the platform's domain model | Determined service by service. |
| Customer-specific behavior | Layered modules and configuration | Custom project design | Configuration can be strong inside supported boundaries | Usually strong inside the platform model | Custom design across services. |
| Provider choice | Provider modules preserve capability boundaries | Broad ecosystem; integration is project-owned | Usually marketplace/vendor dependent | Usually vendor ecosystem dependent | Maximum choice with maximum integration ownership. |
| Deployment evolution | Consolidated and modular topology are part of the application model | Possible, but designed by the project | Commonly platform-managed | Commonly product-defined | Native goal, with high operational overhead. |
| AI-assisted engineering governance | Repository contracts, module ownership, generated context, and tests guide changes | Must be added by the project | Platform may constrain generated changes | Product tooling varies | Must be standardized across repositories and teams. |
| Lock-in profile | Nodics conventions and Node.js implementation; providers can be replaced through contracts | Framework APIs plus project architecture | Often high platform and data-model dependence | Often high product-model dependence | Cloud, protocol, data, and service implementation choices can still create lock-in. |
| Team responsibility | Learn and apply Nodics contracts | Design architecture and governance | Configure platform and manage exceptions | Learn product model and extension system | Design, secure, test, deploy, observe, and govern a distributed platform. |

## The Most Relevant Alternatives

Nodics is not simply a replacement for one named framework. It combines
concerns that are often assembled from several categories:

- a web/API framework for request handling;
- application architecture conventions for services and data;
- identity and tenant-aware behavior;
- jobs, events, messaging, cache, search, import, and export;
- runtime and deployment governance;
- generated contracts, tests, and AI guidance.

For a fair comparison, compare the complete solution needed to operate your
product, not Nodics against the HTTP layer of another framework.

## How To Run A Fair Proof Of Concept

Ask each candidate approach to implement the same representative scenario:

1. Create a tenant-aware business record and secured API.
2. Add a customer-specific rule without changing shared framework source.
3. Add a scheduled or event-driven process.
4. Replace or configure one infrastructure provider.
5. Generate or publish the API contract.
6. Test authorized, unauthorized, invalid, boundary, and tenant-isolation cases.
7. Explain how the application moves from one process to modular deployment.
8. Show how a new developer or AI tool discovers where the next change belongs.

Measure delivery time, but also measure the amount of custom platform code,
operational complexity, test evidence, customization safety, and expected
maintenance cost.

## Continue

- Previous: [Business Capabilities And Outcomes](business-capabilities-and-outcomes.md)
- Next: [Business And Technical Evaluation Checklist](evaluation-checklist.md)
- Technical organization: [How Nodics Is Organized](../architecture/how-nodics-is-organized.md)
- Documentation home: [Nodics Documentation](../README.md)
