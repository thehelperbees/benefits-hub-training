# Simpra

Built out (October 2026), forked from the Alignment build (single benefit, points-based). This folder holds what
differs from the generic training in `/shared/`:

- `index.html` + `Begin-Training.html` - Simpra's own login gate and hub
  (login: `casemanager` / `SIMPRAtraining2026`; SHA-256 hashes in `index.html`)
- `module-2-signing-in/` - username/password + verification-code sign-in at
  simprabenefits.thehelperbees.com/login
- `module-3` to `module-5`, `module-7` - Simpra's single "Companion Care" benefit tile
  covering Companion Care and Virtual Companion; visits (1 point = 1 visit, 2-hour max per visit);
  allotment 30 (ISNP) / 25 (DSNP, IESNP); THB tester member (Test Member1)
- `module-6-managing-exceptions/` - Simpra Zendesk: thbsimpra-advantage.zendesk.com
- `library.html` + `resources/` - Simpra job aids and Case Manager FAQ

Module 1 (`shared/module-1-why-benefits-hub/`) is reused as-is.

Source: Training & Quality request LA-2026-10-06-1073 (Simpra 2027) plus tester screenshots.

## Still to do
- Narration: `assets/audio/` folders are empty; scripts to be written and recorded
  (the Play button hides itself when a clip is missing)
- Recapture benefit-tile.png on a tester with no pending referral so it matches Module 4/5 numbers
- Confirm Companion Care service-task list and Source value (placeholders in Modules 5 and 7)
