# Alignment

Built out (September 2026), forked from the BCBS AR build. This folder holds what
differs from the generic training in `/shared/`:

- `index.html` + `Begin-Training.html` - Alignment's own login gate and hub
  (login: `casemanager` / `ALIGNMENTtraining2026`; SHA-256 hashes in `index.html`)
- `module-2-signing-in/` - username/password sign-in at alignmentbenefits.thehelperbees.com
- `module-3` to `module-5`, `module-7` - Alignment's single Housecleaning benefit
  (Light Housecleaning - Copay + Standard Housecleaning - Copay), invented demo members
- `module-6-managing-exceptions/` - Alignment Zendesk: alignment-thb.zendesk.com
- `library.html` + `resources/` - Alignment job aids and Case Manager FAQ

Module 1 (`shared/module-1-why-benefits-hub/`) is reused as-is.

## Still to do
- Recapture benefit-tile.png and the Standard service screen once the tester has an allowance (10) and Standard points (1.00) set - the tile shows dashes for Plan Allowance/Used/Pending/Remaining today
- Narration: `assets/audio/` folders are empty; scripts to be written and recorded
  (the Play button hides itself when a clip is missing)
- Confirm whether non-copay service variants exist (services are named '... - Copay')

Screenshots: sign-in, verification email, home, search and advanced search are shared with the Aetna build
(search.png shows Aetna's fake test ID typed in the box). Landing page, benefit tile and Zendesk form are Alignment captures
(tester member Honey Bee).

All training data (names, IDs, addresses, phone numbers, emails) comes from the THB tester member or is
invented and marked as fake per the THB synthetic-data rule.
