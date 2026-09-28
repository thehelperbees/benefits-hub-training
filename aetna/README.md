# Aetna

Built out. This folder holds what differs from the generic training in
`/shared/`:

- `index.html` + `Begin-Training.html` — Aetna's own login gate and hub,
  separate from the root/SCAN front door
- `module-2-signing-in/` — standard username/password + email verification
  flow, with Aetna's real Benefits Hub sign-in URL
- `module-3-finding-your-member/`, `module-4-adding-a-referral/`,
  `module-5-managing-a-referral/`, `module-7-knowledge-check/` — forked from
  `/shared/` with Aetna's real services (Personal Care, Post Discharge In
  Home Support, Social Needs Companion) swapped in
- `module-6-managing-exceptions/` — Aetna's real support-ticket routing and
  Zendesk URL; no grievance form, so that path was removed entirely
- `library.html` + `resources/` — Aetna's resource library, linking the
  shared job aids plus Aetna-specific job aids and the Aetna Case Manager FAQ

Module 1 (`shared/module-1-why-benefits-hub/`) is unforked and reused as-is.

See `/scan/` for the original built-out example this pattern was based on.
