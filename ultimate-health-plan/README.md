# Ultimate Health Plan

Built out. This folder holds what differs from the generic training in `/shared/`
(forked from the BCBS AR build, which has the same single-benefit shape):

- `index.html` + `Begin-Training.html` - Ultimate's own login gate and hub
  (`casemanager` / `ULTIMATEtraining2026`)
- `module-2-signing-in/` - standard email/password + verification-code sign-in at
  `ultimatebenefits.thehelperbees.com`
- `module-3-finding-your-member/`, `module-4-adding-a-referral/`,
  `module-5-managing-a-referral/`, `module-7-knowledge-check/` - forked with Ultimate's
  single benefit, In-Home Support Services (Companionship), and its one service, Companion Care
  (30 hours per member per year, hours tracked on the referral's Encounter Summary)
- `module-6-managing-exceptions/` - support-ticket routing to `uhp-thb.zendesk.com`; no
  Account Coordinator step
- `library.html` + `resources/` - Ultimate job aids and Case Manager FAQ

Module 1 (`shared/module-1-why-benefits-hub/`) is unforked and reused as-is.

## Narration

Audio is not included yet. Each module's `assets/audio/` folder is empty; the pages play
fine without it and hide the narration button when a clip is missing. Filenames the pages
expect are listed in `NARRATION_SCRIPTS.md`.

## Data

The training member (Honey Bee, UL1234567) is the tester account. Every provider, staff
member, ticket and invoice value in the simulated screens is an invented placeholder.
