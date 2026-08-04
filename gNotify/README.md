# Notifications & Messaging (`gNotify`)

`gNotify` is Nodics' provider-neutral communication composition group. Business modules own the event and business context; Profile/Customer owns communication preferences; Workflow owns long-running approvals; `nOtp` owns token mechanics; `gNotify` owns template resolution, safe rendering, delivery policy, provider selection, immutable evidence, retry, suppression, and verification delivery.

## Start here

- Business users: use Axis **Notifications & Messaging** workspaces to browse Channel -> Scenario -> Template, preview safe sample content, and review delivery evidence.
- Decision makers: configure channels, consent posture, approval requirements, providers, fallback, retention, and risk by customer layer without forking the framework.
- Developers: send a business intent through `DefaultNotifyDeliveryService.send`; never call an email/SMS vendor from a business module.
- Platform engineers: replace provider adapters or context/consent providers by Nodics service hierarchy and configuration override.

The group is composition-only. Runtime ownership is split into `notifySchema`, `notifyCore`, `notifyVerification`, `notifyApi`, and replaceable provider modules such as `localNotifyProvider`. See `notifyCore/llm/contracts/notification-framework-contract.md` for contracts, examples, failure recovery, security, extension points, and operating guidance.
