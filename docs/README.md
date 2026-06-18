# Refactoring Workspace

This directory contains temporary modernization plans, historical capability
evidence, and the refactoring backlog for Nodics Revolution.

## Boundary

- Runtime startup, clean, build, test, generation, and quality commands must not
  read configuration or executable behavior from this directory.
- Durable framework standards belong under `gSetup/llm` or their owning module.
- Generated runtime contracts belong under the active environment, server, or
  node module.
- Files here may be reorganized or removed after the refactoring program is
  complete without changing Nodics behavior.

The Postman collection is retained only as historical capability evidence; it
is not the source of truth for current API behavior.
