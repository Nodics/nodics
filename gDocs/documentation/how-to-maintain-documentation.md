# How To Maintain Documentation

Documentation is part of the Nodics product.

It helps new users learn, helps experienced developers move quickly, and helps AI tools avoid unsafe implementation choices.

## Documentation Types

Nodics has several documentation types.

**Root README**

The root README is the public entry point. Keep it short, friendly, and easy to scan.

**Public documentation**

The `gDocs` folder contains user and developer guides.

**Module README files**

Each module README explains the purpose, behavior, configuration, extension points, and tests for that module.

Use [Module Documentation Index](../reference/module-documentation-index.md)
to connect public task guides to module-owned README and docs pages.

**AI and implementation contracts**

`AGENTS.md` and `gSetup/llm` contain rules for AI tools and developers changing the codebase. They guide implementation work and do not replace user-facing documentation.

**Generated documentation**

Regenerate generated API docs, generated LLM context, and generated reports from source definitions.

## Documentation Source Map

Use the right documentation layer for the right audience.

| Documentation | Audience | Purpose |
| --- | --- | --- |
| Root `README.md` | New visitors, evaluators, and developers | Explain what Nodics is, why it exists, and where to start. |
| `gDocs` | Users, application developers, framework developers, and technical leads | Provide task-based guides such as setup, APIs, data, jobs, security, testing, and deployment. |
| Module `README.md` files | Developers working inside one capability | Explain module purpose, owned schemas/routes/services/data/tests, configuration, extension paths, and verification. |
| Module `docs/` folders | Developers needing deeper module detail | Hold permanent module documentation that belongs with the product. |
| `gDocs/reference/module-documentation-index.md` | Users and developers moving from guide pages to module details | Maps task-based documentation to the module README and module docs that own exact capability behavior. |
| `AGENTS.md` | AI tools and developers changing code | Define local implementation behavior, ownership boundaries, and safety rules. |
| `gSetup/llm` | AI tools, automation, and developers doing implementation work | Define cross-cutting contracts, prompts, standards, generated context rules, and structure guidance. |
| Generated LLM context | AI tools and reviewers | Summarize source-derived module facts and documentation gaps after regeneration. |

## Writing Style

Write for guided adoption first. A Nodics page should be understandable by a
developer with basic programming knowledge, useful to an experienced developer,
and explicit enough for an AI tool to place code in the correct folder without
inventing a new structure.

Start with plain language:

- what the feature is;
- why it exists;
- when to use it;
- what problem it solves;
- where code belongs;
- how to customize it safely;
- how to verify it.

Then add deeper framework internals for advanced readers.

Use task-based titles:

- How to set up Nodics.
- How to create a scheduled job.
- How to add configuration.
- How to create an API.
- How to test a change.

Avoid internal-only titles unless the reader must know the internal name.

Prefer:

```text
How To Create Scheduled Jobs
```

Instead of:

```text
cronjob module internals
```

## Required Detail

Every page explains:

- Purpose.
- When to use it.
- Step-by-step process.
- Files or folders involved.
- Which layer owns each change.
- Where code should be written.
- Configuration involved.
- Security considerations.
- Testing commands.
- Common mistakes.
- Extension or customization path.
- Generated artifacts that must be regenerated.
- AI/developer rules that must be preserved.

## Updating Documentation With Code

When code changes, ask:

- Does the public behavior change?
- Does configuration change?
- Does a route, schema, service, job, import/export process, or permission change?
- Does a module extension contract change?
- Does the AI/developer implementation rule change?
- Do generated docs need regeneration?

If yes, update the related docs in the same work.

## Using Planning Notes

Planning notes and captured product notes preserve useful concepts and page structure. Final documentation states current Nodics behavior directly.

For each topic:

1. Preserve the useful concept.
2. Verify the current implementation.
3. Update terminology.
4. Add current commands and tests.
5. Move module-specific detail to the module README.
6. Keep broad user guidance in `gDocs`.

## Verification

Run:

```bash
npm run docs:coverage:source -- --limit=20
npm run docs:coverage:contracts -- --limit=20
npm run llm:generate
npm run llm:validate
```

Use documentation review as part of feature review, not as a cleanup task after the feature is finished.
