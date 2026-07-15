# How To Create Scheduled Jobs

Scheduled jobs are automated tasks that run at configured times.

Examples:

- Clean expired tokens.
- Send queued messages.
- Import files from a trusted location.
- Rebuild indexes.
- Publish pending content.
- Reconcile failed workflow items.

## When To Use A Scheduled Job

Use a scheduled job when work should happen automatically without a user request.

Do not use a scheduled job when:

- The work must happen immediately inside an API transaction.
- The work should be triggered by an event.
- The work belongs to a workflow step.
- The work requires manual approval before every run.

## What A Job Needs

A scheduled job usually needs:

- A name.
- A schedule.
- An owner module.
- A service function to execute.
- Configuration.
- Permission or runtime guard rules when applicable.
- Logs.
- Failure handling.
- Tests.

## Node Ownership

In a multi-node application, not every node should run every job.

Document:

- Which server or node owns the job.
- Whether failover is allowed.
- Whether only one node can run it at a time.
- What happens if the node stops during execution.

This is important because duplicate scheduled work can create duplicate data, repeated messages, or conflicting updates.

## Job Implementation Pattern

Keep the actual business behavior in a service.

The job should trigger the service. The service should be testable without waiting for the schedule.

Recommended shape:

1. Job definition identifies when and where the job runs.
2. Job handler receives execution context.
3. Handler calls the owning service.
4. Service validates input and tenant context.
5. Service performs work.
6. Result is logged.
7. Failure is captured with diagnostics.

## Creating A New Job

Steps:

1. Decide which capability owns the job.
2. Add the job definition in that module.
3. Add or update configuration for the schedule.
4. Implement the service behavior.
5. Add logs and failure behavior.
6. Add tests for lifecycle, handler behavior, and node responsibility.
7. Document how to run, update, and disable the job.

## Testing Scheduled Jobs

Run scheduled-job tests through:

```bash
npm run test:suite -- --suite=cronjob
```

The main test gate also includes scheduled-job coverage:

```bash
npm run test:basic
```

## What To Avoid

Avoid:

- Running the same job on multiple nodes unintentionally.
- Hiding job behavior inside configuration only.
- Creating jobs with no logs.
- Swallowing failures.
- Using jobs for work that should be event-driven.
- Putting customer-specific job behavior into framework code.

