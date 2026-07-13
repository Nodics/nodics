# quizer

`quizer` is the quiz group module. It composes quiz capabilities such as `quiz`, `wquiz`, and `vquiz` and provides shared configuration for quiz-oriented behavior.

Use this group for composition and shared quiz defaults. Capability behavior belongs in the child modules.

Quiz extensions should remain schema-driven, test-backed, and tenant-aware so application projects can adjust quiz behavior without modifying shared modules.
