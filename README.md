Being an extremely interactive JS based enterprise API management framework, Nodics provides you with highly customizable modular architecture design. Based on the latest technologies, it aims at exposing micro services which can be used as REST APIs to provide best in industry experience. The availability of the services within modules makes the job easier and implementation simpler. Flexibility of the platform provides you with extensible modules, where one module can be easily extended by other to provide best in class experience, Exposure of data models and REST web services, makes reach to the data bases simpler.

## gSetup

`gSetup` is the Nodics setup and onboarding package. It follows the standard Nodics module folder shape with `package.json`, `nodics.js`, and `readme.md`, but it is not part of Nodics runtime startup and must not be included in active server, node, or module startup lists.

The `gSetup/package.json` file marks it as non-runtime with `runtimeModule: false`, so the module discovery process skips it while developers still see a familiar Nodics folder structure.

Use `gSetup` for durable setup instructions, AI/LLM onboarding context, prompts, decision memory, and project working rules. It should not contain generated artifacts.

When starting a new Nodics project or asking an LLM such as ChatGPT, Claude, Codex, or a local coding agent to work on Nodics, bootstrap it with:

```text
Read gSetup/llm/README.md first, then follow the linked Nodics principles, modular architecture, schema/generation rules, testing playbook, and feature process before changing code.
```

If an LLM automatically scans the repository, `gSetup/llm/README.md` should be treated as the canonical instruction entry point for Nodics development.

For more detail, visit http://www.nodics.com

For complete product documentation, visit out WIKI http://nodics.com/wiki-home/nodics/
