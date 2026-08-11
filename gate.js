/* Benefits Hub Training - access gate check
   Loaded synchronously in <head> on every protected page.
   If the visitor hasn't passed the login screen this session,
   send them back to it before any page content renders. */
(function () {
  try {
    if (sessionStorage.getItem('bh_authed') === '1') { return; }
  } catch (e) {
    // sessionStorage unavailable (very old browser / privacy mode) - fail safe to login
  }
  var s = document.currentScript;
  var home = (s && s.getAttribute('data-home')) || 'index.html';
  window.location.replace(home);
})();
