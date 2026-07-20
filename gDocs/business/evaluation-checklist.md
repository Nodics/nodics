# Business And Technical Evaluation Checklist

Use this checklist before selecting Nodics for a product or customer program.
Record evidence, owners, risks, and follow-up actions rather than answering only
yes or no.

## Business Fit

- What business capability will the first release prove?
- How many customer or tenant variations are expected?
- Which foundations would otherwise need to be designed and maintained by the
  delivery team?
- What is the expected product lifetime and team growth?
- Does the organization accept a governed framework in exchange for less
  architectural freedom?
- What delivery-time and maintenance-cost measures will be compared?

## Product And Delivery Fit

- Build one representative capability, not only a hello-world route.
- Demonstrate API, data, permissions, configuration, tests, and documentation.
- Demonstrate a project-level customization without editing framework source.
- Identify which available modules are production-ready and which require
  further implementation or provider qualification.
- Estimate team learning, migration, and operational enablement effort.

## Security And Compliance Fit

- Verify human authentication separately from module-to-module and scheduled
  access.
- Verify authorization, tenant isolation, validation, secrets handling, audit,
  and sensitive-data treatment.
- Confirm regulatory, retention, residency, encryption, and evidence needs for
  the intended deployment.
- Test failure and misuse cases, not only successful access.

## Architecture And Integration Fit

- Confirm which module owns every proposed capability.
- Identify external systems, data contracts, failure behavior, retries, and
  provider ownership.
- Check for existing Nodics capabilities before introducing a second loader,
  registry, policy engine, or source of truth.
- Confirm how frontend applications consume APIs while Nodics remains the
  backend/API platform.
- Define the path from the initial topology to expected scale.

## Operations And Commercial Fit

- Define service-level objectives, observability, incident response, backup,
  recovery, and capacity expectations.
- Verify deployment automation and environment separation.
- Determine internal ownership, support expectations, licensing obligations,
  and upgrade responsibility.
- Estimate the total cost of the complete solution, including infrastructure,
  providers, delivery, operation, and training.

## Decision Record

The final decision should state:

- the business outcomes Nodics is expected to improve;
- proof-of-concept evidence;
- known gaps and required investments;
- selected providers and their maturity;
- security and operational acceptance;
- accountable business and technical owners;
- exit or reassessment criteria.

## Continue

- Previous: [How Nodics Compares](how-nodics-compares.md)
- Start a technical evaluation: [How To Set Up Nodics](../getting-started/how-to-setup-nodics.md)
- Build a representative capability: [Build Your First Nodics Capability](../getting-started/build-your-first-capability.md)
- Documentation home: [Nodics Documentation](../README.md)
