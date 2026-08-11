# Benefits Hub Training — GitHub Pages Package

This folder is ready to publish as-is via GitHub Pages. Case managers will
hit a login screen first, then land on the training hub.

## What's in here

- `index.html` — the login gate (this is what loads at your site's root URL)
- `gate.js` — small script every module page loads to check that a visitor
  has signed in this session; if not, it bounces them back to `index.html`
- `Begin-Training.html` — the training hub / module menu (unchanged, just gated)
- `module-1-why-benefits-hub/`, `module-2-signing-in/`,
  `module-3-finding-your-member/`, `module-4-adding-a-referral/`,
  `module-5-managing-a-referral/`, `module-6-managing-exceptions/`,
  `module-7-knowledge-check/` — the modules themselves (unchanged content,
  gated, folders renamed to match the current 7-module numbering)

## Default credentials

- **User ID:** `casemanager`
- **Password:** `SCANtraining2026`
- Both are checked case-insensitively, so caps lock or typos in casing won't
  lock anyone out.

**Change these before you share the link.** See "Changing the credentials" below.

## Important: what this gate does and doesn't do

Please read this before deciding it's sufficient for your needs.

- Someone who **doesn't have the link** or the credentials cannot see the
  content through the published site. Search engines won't index it either
  (a `robots.txt`-style meta tag is on the login page).
- Someone who has the credentials can share them, so treat the password the
  same way you'd treat a shared Wi-Fi password — easy to hand out, not
  something to publish in a newsletter.
- **Because the GitHub repo itself is public, the raw files are also
  technically visible** to anyone who finds the repo directly on
  github.com or clones it — the login screen only gates the *published
  website*, not the underlying GitHub repo. For training content like this
  (no member PII, no credentials to real systems), that's a reasonable
  trade-off. If that ever changes — real member data, credentials, anything
  sensitive ends up in these modules — this approach is no longer
  sufficient and you'd want a private repo with a real login system instead.
- This is a **shared password gate**, not individual accounts. There's no
  way to know which case manager viewed what, and no way to revoke one
  person's access without changing the password for everyone.

If that trade-off works for your use case, the setup below gets you live in
about 10 minutes.

## One-time setup: publish to GitHub Pages

1. **Create a new repository** on your GitHub account.
   - Suggested name: `benefits-hub-training`
   - Visibility: Public (Pages requires a paid plan to publish privately)
   - Don't initialize with a README (you already have one here)

2. **Upload these files.** Easiest path with just a browser:
   - On the new repo's page, click **"uploading an existing file"**
   - Drag in *everything inside this folder* (not the folder itself —
     `index.html`, `gate.js`, `Begin-Training.html`, `README.md`, and all
     the `module-*` folders should sit at the top level of the repo)
   - Commit directly to the `main` branch

   (If you're comfortable with git/command line instead, `git add .`,
   `git commit -m "Initial upload"`, `git push` works the same way.)

3. **Turn on GitHub Pages:**
   - In the repo, go to **Settings → Pages**
   - Under "Build and deployment," set **Source** to "Deploy from a branch"
   - Set **Branch** to `main` and folder to `/ (root)`, then **Save**
   - GitHub will show you the live URL, something like:
     `https://<your-username>.github.io/benefits-hub-training/`
   - It can take a minute or two to go live the first time

4. **Test it:**
   - Open the URL above in an incognito/private window
   - Confirm you're prompted to sign in
   - Sign in and confirm you land on the training hub and can open each module

5. **Share the link and credentials** with case managers separately (e.g.
   link in an email, password given verbally or in a separate message) —
   don't put both in the same place.

## Changing the credentials

The password isn't stored as plain text in the page (it's a SHA-256 hash),
so you can't just edit a word in the file — you need to generate a new hash.
Easiest way: ask Claude to regenerate `index.html` with your new User ID and
password, and it'll produce the file with the correct hashes already in
place. If you'd rather do it yourself, any SHA-256 generator works — just
make sure the value you hash is **lowercased and trimmed** first, since
that's what the login page does before comparing.

## Updating content later

Any time a module changes, just re-upload the updated file(s) to the same
repo (GitHub will ask to confirm the overwrite) — Pages picks up the change
automatically within a minute or two. No need to touch `index.html` or
`gate.js` unless you're changing credentials.
