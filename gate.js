/* Benefits Hub Training - access gate check
   Loaded synchronously in <head> on every protected page.
   If the visitor hasn't passed the login screen this session,
   send them back to it before any page content renders.

   Partner-aware: shared module pages (used by multiple partners) are
   opened with a ?partner=<folder> query param by that partner's own
   Begin-Training page. When present, the login redirect target is
   rewritten to that partner's own index.html instead of the generic
   root one, so a partner with a separate front door (like Aetna)
   doesn't get bounced to a different partner's login page. */
(function () {
  try {
    if (sessionStorage.getItem('bh_authed') === '1') { return; }
  } catch (e) {
    // sessionStorage unavailable (very old browser / privacy mode) - fail safe to login
  }
  var s = document.currentScript;
  var home = (s && s.getAttribute('data-home')) || 'index.html';
  try {
    var partner = new URLSearchParams(window.location.search).get('partner');
    if (partner) { home = home.replace(/index\.html$/, partner + '/index.html'); }
  } catch (e) {}
  window.location.replace(home);
})();
