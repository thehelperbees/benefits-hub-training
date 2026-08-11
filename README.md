# Benefits Hub Training — GitHub Pages Site

Live at: `https://thehelperbees.github.io/benefits-hub-training/`

Case managers hit a login screen first, then land on the training hub.

## Structure: shared modules + partner-specific forks

This site is built to hold training for many partners in one place, without
duplicating content that's identical across all of them.

```
/index.html                        ← one login for every partner
/gate.js
/Begin-Training.html               ← hub / module menu (currently SCAN's)
/shared/                           ← generic modules, used by every partner
    module-1-why-benefits-hub/
    module-2-signing-in/           ← standard verification-code flow
    module-3-finding-your-member/
    module-4-adding-a-referral/
    module-5-managing-a-referral/
    module-7-knowledge-check/
    resources/                     ← generic job aid PDFs
/scan/                             ← SCAN's partner-specific content
    module-6-managing-exceptions/  ← real SCAN Zendesk routing
    library.html                   ← SCAN's resource library page
    resources/                     ← SCAN Case Manager FAQ.pdf
/aetna/, /hap/, /humana/, ...      ← placeholder folders for every other
                                      partner on the current plan list, each
                                      just a README for now (see below)
```

**The rule of thumb:** a module only gets forked into a partner folder if it
actually differs by partner. Based on what's been built for SCAN, that's
usually:
- **Signing In** — if the partner uses SSO or some other non-standard flow
  instead of the default verification-code step in `/shared/module-2-signing-in/`
- **Managing Exceptions and Escalations** — the real support-ticket/grievance
  routing details and Zendesk URL are partner-specific
- **The resource library** — each partner likely wants its own FAQ PDF, even
  though the job aids themselves (Signing In, Finding a Member, etc.) stay
  the same and live in `/shared/resources/`

Everything else — Finding a Member, Adding a Referral, Managing a Referral,
the Knowledge Check — is generic Benefits Hub behavior and shouldn't need a
partner-specific copy.

**⚠️ Known gap:** `/shared/module-2-signing-in/` currently shows the generic
verification-code sign-in flow. The real SCAN SSO variant (no verification
step, SSO link instead) was built separately and isn't merged into this
site yet. Until it is, SCAN case managers will see the generic flow, not
their actual sign-in experience. When that SSO build is ready, it should
become `/scan/module-2-signing-in/` (a fork, not a replacement of the
shared version — other partners without SSO still need the generic one).

## Partner placeholder folders

Every plan on the current partner list has an empty folder at the repo root
(e.g. `/aetna/`, `/humana/`, `/bcbs-az/`) containing just a `README.md`.
These exist so the folder structure is ready to receive content, but **none
of them are wired into any navigation yet** — the hub page (`Begin-Training.html`)
currently only shows SCAN's modules. When a new partner's content is ready:

1. Drop its partner-specific modules/library into its folder (see the
   README inside that folder, or copy the pattern from `/scan/`)
2. Decide how it should be reachable — either build that partner its own
   hub page, or evolve `Begin-Training.html` into a partner picker. This
   hasn't been designed yet since only SCAN has real content so far.

Git doesn't track empty folders, so if a placeholder folder's `README.md`
is ever removed, the empty folder will silently disappear on next push —
that's normal git behavior, not a bug.

## Default credentials

- **User ID:** `casemanager`
- **Password:** `SCANtraining2026`
- Checked case-insensitively.

To change these, tell Claude the new User ID/password and it'll regenerate
`index.html` with the correct SHA-256 hashes (the password isn't stored as
plain text, so it can't just be hand-edited).

## What the login gate does and doesn't protect

- Blocks casual visitors and search engines from seeing content through the
  published site.
- Does **not** protect the underlying GitHub repo — since the repo is
  public, anyone who finds it directly on github.com (rather than through
  the published Pages site) can see the raw files. Fine for training
  content with no member PII; not sufficient if that ever changes.
- One shared password for everyone — no individual accounts, no per-person
  revocation.

## Publishing changes

This repo is cloned locally via GitHub Desktop. To publish any update:
1. Copy the changed/new files into the local cloned folder (same relative
   paths as above)
2. In GitHub Desktop: review the changes listed, write a commit summary,
   **Commit to master**, then **Push origin**
3. Pages picks up the change automatically within a minute or two — no
   settings need to be touched again
