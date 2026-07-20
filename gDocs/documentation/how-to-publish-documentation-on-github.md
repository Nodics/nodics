# How To Publish Documentation On GitHub

This guide explains how Nodics documentation appears to people browsing the GitHub repository.

The goal is simple:

```text
Users find clear documentation from GitHub without needing to understand internal repository history.
```

## Beginner Summary

GitHub has several places where people may look for documentation. Nodics keeps
the source-controlled documentation in the repository so docs change together
with code.

Use this mental model:

| Place | Purpose |
| --- | --- |
| Root `README.md` | Short public front door. |
| `gDocs` | Main user and developer documentation source. |
| Module `README.md` files | Exact capability details for one module. |
| GitHub Pages | Published website view of repository docs. |
| GitHub Wiki | Optional index or mirror, not the source of truth. |

## Recommended Approach

Use this structure:

1. Keep the root `README.md` short and friendly.
2. Keep detailed documentation in `gDocs`.
3. Publish `gDocs` as a GitHub Pages documentation site.
4. Use GitHub Wiki only as an optional index or mirror.

This keeps documentation changes reviewable with code while still giving users a readable documentation experience.

## Why Not Put Everything In The Root README

The root README is the front door.

It helps a new visitor answer:

- What is Nodics?
- Why should I use it?
- How do I start?
- Where is the full documentation?

It does not contain every feature, every setup detail, every module rule, or every internal implementation contract.

Long README files become hard to scan. They also make it harder for new users to know where to begin.

## Why Use `gDocs`

The `gDocs` folder is the documentation source that lives with the repository.

This means:

- Documentation changes can be reviewed with code changes.
- Links can point to exact repository files.
- Documentation can be versioned with branches.
- Developers can update docs in the same pull request as implementation.
- GitHub Pages can publish the same content as a website.

## Why Use GitHub Pages

GitHub Pages is a good fit for the official documentation site.

It can provide:

- A public documentation URL.
- Better navigation than raw Markdown.
- Search when a documentation generator is added.
- A cleaner experience for new users.
- Versioned documentation later if needed.

At first, Nodics can publish simple Markdown pages. Later, it can use a documentation generator such as MkDocs, Docusaurus, or Jekyll.

## How GitHub Wiki Should Be Used

Use GitHub Wiki as an index or mirror, not as the source of truth.

Recommended Wiki use:

- Create a `Home` page.
- Explain that official documentation lives in `gDocs` or the GitHub Pages site.
- Link to the main documentation sections.
- Optionally mirror stable overview pages.

Avoid using GitHub Wiki as the only maintained copy because it is a separate git repository from the main codebase. Documentation can drift when code and docs are reviewed separately.

## Suggested GitHub Wiki Home Page

Use content like this:

```markdown
# Nodics Documentation

Welcome to Nodics documentation.

The official documentation source lives in the main repository under `gDocs`.

Start here:

- What Nodics Is
- How To Set Up Nodics
- How Nodics Is Organized
- How Configuration Works
- How To Create APIs
- How To Create Scheduled Jobs
- How To Test Nodics Changes

For the latest source-controlled documentation, use the repository documentation or the published GitHub Pages site.
```

## Suggested GitHub Pages Flow

Use this flow when the repository is ready to publish:

1. Keep documentation source in `gDocs`.
2. Add a documentation site configuration.
3. Configure GitHub Pages to publish the generated site.
4. Add a link from root `README.md` to the published site.
5. Add a link from GitHub Wiki to the published site.
6. Keep module README files linked from the relevant `gDocs` pages.

## Documentation Source Rule

Use this rule:

```text
If documentation explains Nodics behavior, maintain it in the repository.
```

GitHub Wiki may display or link to documentation, but repository documentation remains the controlled source.

## What To Avoid

Avoid:

- Copying planning notes directly without turning them into current product documentation.
- Keeping one version in `gDocs` and another different version in GitHub Wiki.
- Putting AI-only implementation rules into public user documentation.
- Making root README the full documentation site.
- Publishing private planning material from root `docs`.

## Next Step

The next practical step is to continue expanding `gDocs` one topic at a time. Start with high-value user tasks:

- Set up Nodics.
- Create an application module.
- Create configuration.
- Create APIs.
- Work with data.
- Create scheduled jobs.
- Configure users, tenants, and permissions.
- Test and deploy changes.

## Continue

- Related: [Documentation Maintenance Guide](how-to-maintain-documentation.md)
- Module navigation: [Complete Module Catalog](../reference/module-catalog.md)
- Documentation home: [Nodics Documentation](../README.md)
