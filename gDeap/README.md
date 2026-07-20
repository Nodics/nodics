# gDeap

`gDeap` is the Data Engineering and Analytics Platform capability group. It
organizes a simple responsibility chain: consume data from an approved source,
process it through governed transformations, and publish it to an approved
destination.

The group is an ownership boundary, not a second import/export engine. File and
record import/export contracts remain in `gFramework/nData`; search, messaging,
events, databases, and external providers remain owned by their respective
modules.

## Module Family

| Stage | Owner | Current evidence |
| --- | --- | --- |
| Consume | [dataConsumer](dataConsumer/README.md) | External/internal schemas, event handlers, process service, generated schema/API/scenario contracts. Requires flow-specific source and operational qualification. |
| Process | [dataProcessor](dataProcessor/README.md) | Capability scaffold and extension slots; project transformations and behavioral tests are still required. |
| Publish | [dataPublisher](dataPublisher/README.md) | Capability scaffold and extension slots; destination providers and behavioral tests are still required. |

## End-To-End Contract

Every DEAP flow should define:

- business owner and authoritative source;
- input schema/version and source identity;
- tenant, classification, retention, and consent/access policy;
- message, record, batch, checksum, and idempotency identity;
- validation, quarantine, duplicate, ordering, retry, and replay behavior;
- deterministic transformations and lineage;
- authoritative target and publishing/delivery acknowledgement;
- audit, metrics, reconciliation, rollback or compensation, and recovery;
- performance limits and positive, negative, boundary, integration, and
  regression tests.

## What To Avoid

- Duplicating `nData`, messaging, search, or provider clients inside DEAP.
- Accepting arbitrary URLs, credentials, processors, schemas, or destinations
  from request payloads.
- Treating a generated CRUD API as a complete ingestion or publishing product.
- Losing tenant, source, correlation, lineage, or idempotency context between
  stages.
- Claiming production readiness from scaffold structure alone.

## Continue

- Public DaaS guide: [How To Use Nodics As Data As A Service](../gDocs/data/how-to-use-nodics-as-data-as-a-service.md)
- Data movement family: [nData](../gFramework/nData/README.md)
- Messaging: [nEms](../gFramework/nEms/README.md)
- Search: [nSearch](../gFramework/nSearch/README.md)
