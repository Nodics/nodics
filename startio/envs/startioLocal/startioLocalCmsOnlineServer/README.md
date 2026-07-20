# startioLocalCmsOnlineServer

`startioLocalCmsOnlineServer` is the local Online CMS delivery target. It runs
the CMS capability without publish/version provider variants, imports only
integrity-checked manifests from the authenticated Staged server, and switches
target-local Online pointers atomically.

Its `startioCmsOnline` database is deliberately separate from the Staged CMS
database. This process does not run WCMS approval workflows and must never be
used as an authoring fallback.
