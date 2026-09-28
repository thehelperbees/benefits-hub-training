# Clever Care

No partner-specific content built yet.

Once this partner's variants are ready, this folder should hold only what
differs from the generic training in `/shared/`. Based on the SCAN build,
that's typically:

- `module-2-signing-in/` — if this partner uses SSO or another non-standard
  sign-in flow (the default in `/shared/module-2-signing-in/` assumes a
  verification-code step)
- `module-6-managing-exceptions/` — this partner's real support-ticket /
  grievance routing details and Zendesk URL
- `library.html` + `resources/` — a resource library page for this partner,
  linking out to the shared job aids in `/shared/resources/` plus any
  partner-specific FAQ or reference PDF

See `/scan/` for a complete, built-out example of this pattern.
