# Online CMS runtime contract

This server is the non-versioned deployment and delivery side of the local CMS
topology. Only internal-token-protected target APIs may import, activate, query,
or roll back immutable manifests. Direct Staged database access and local
publication lifecycle execution are prohibited.
