# Documentation Images

This folder contains product documentation images recovered from the Nodics Wiki documentation archive and renamed for stable Markdown references.

Use these images only when they help a reader understand a platform concept, process flow, runtime topology, security boundary, data movement path, or deployment model.

## Image Catalog

| Image | Use |
| --- | --- |
| `nodics-architecture.jpg` | Overall Nodics architecture and capability composition. |
| `technology-stack.jpg` | Technology stack overview. |
| `microservices-architecture.jpg` | Modular/microservice deployment view. |
| `enterprise-tenant-design.jpg` | Enterprise, sub-enterprise, and tenant relationship. |
| `cloud-deployment-process.jpg` | Cloud/distributed deployment view. |
| `nodics-structure.png` | Project, module, environment, server, and node structure. |
| `request-process-design.jpg` | Request handling design. |
| `request-process-flow.jpg` | Request handler process flow. |
| `authentication-flow.jpg` | Authentication flow. |
| `authorization-flow.jpg` | Authorization flow. |
| `cron-job-process.jpg` | CronJob process flow. |
| `cron-job-lifecycle.png` | CronJob lifecycle. |
| `event-handler-process.jpg` | Event handling flow. |
| `ems-producer-flow.jpg` | EMS producer flow. |
| `ems-consumer-flow.jpg` | EMS consumer flow. |
| `api-cache-flow.jpg` | API cache flow. |
| `item-cache-flow.jpg` | Item/object cache flow. |
| `search-cache-flow.jpg` | Search cache flow. |
| `data-import-process.jpg` | Data import process flow. |
| `data-export-process.jpg` | Data export process flow. |
| `logger-process-flow.jpg` | Logging process flow. |

## Rules

- Keep images under `gDocs/assets/images`; do not link to private root `docs/` references or old WordPress URLs.
- Prefer diagrams that explain stable concepts. Do not add screenshots for temporary development state.
- When a process changes, update the text and image together. If the image becomes stale, replace it with a maintained Mermaid diagram or a regenerated asset.
- Use meaningful alt text in Markdown.
