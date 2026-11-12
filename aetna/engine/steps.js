/* Shared helpers for the guided Aetna benefit modules (loaded before each module's config.js).
   One kit per training member + program. It puts the embedded Benefits Hub into the state a step expects
   (used when a learner goes Back), fills sample answers, and checks which questions are answered. */
window.GuideKit = function (o) {
  var MID = o.member, PROG = o.program, GROUPS = o.groups || [], QTY = o.qty || 12;
  var K = { MID: MID, PROG: PROG, GROUPS: GROUPS, QTY: QTY };
  function S(H) { return H.TM.S; }
  K.S = S;

  /* sample answers, by question key. Lists are read from the mockup so they stay in sync with the SME's version. */
  K.sample = function (H, key) {
    var L = H.TM.CONFIG.lists, first = function (l, n) { return L[l].slice(0, n).map(function (x) { return x[0]; }); };
    var map = {
      bestNumber: '555-0111', pp1_name: 'Pat Sample', pp1_rel: 'Point of Contact (POC) / family', pp1_phi: 'Yes - PHI may be shared',
      hospital: 'Sample Regional Hospital', anticipatedDischarge: '2027-03-11', careNeeded: '2027-03-12',
      facility: 'Sample Partner Facility', facilityContact: 'Jordan Sample, Activities Director', facilityPhone: '555-0150, sample@example.test',
      prefDates: 'Any weekday next week', prefTimes: 'Mornings between 9 and 11 AM', facilityRules: 'Visitors check in at the front desk. Visiting hours are 9 AM to 5 PM.'
    };
    if (map[key] !== undefined) return map[key];
    if (key === 'conditions') return [L.conditions[H.TM.CONFIG.programs[PROG].oncePerDx ? 0 : 1][0]];   /* [0] is the N/A option: Recovery at Home picks it; Post-Discharge picks a real condition */
    if (key === 'supportNeeds') return first('support', 1);
    if (key === 'adlNeeds') return first('adl', 2);
    if (key === 'ssbci') return first('ssbci', 1);
    if (key === 'dx') return H.TM.CONFIG.sdqs.dx.options[1];       /* [0] is N/A */
    if (key === 'dxPd') return H.TM.CONFIG.sdqs.dxPd.options[0];   /* Post Discharge: N/A - no qualifying diagnosis */
    if (key === 'primaryNeed') return L.pcNeeds[0][0];
    if (key === 'secondaryNeeds') return [L.pcNeeds[1][0]];
    return undefined;
  };

  /* the member's authorization for this program, and what is left on it */
  K.auth = function (H) { return H.member(MID).auths.find(function (a) { return a.program === PROG; }); };
  K.remaining = function (H) { return H.TM.balance(H.member(MID), K.auth(H)).remaining; };

  /* what the learner does when they choose Add Referral (and answer Yes to the new-discharge prompt, if it appears) */
  K.begin = function (H) {
    H.TM.onAddReferral(H.member(MID), K.auth(H).id);
    var yes = H.q('[data-tu="yes"]'); if (yes) yes.click();
  };

  K.ensureMember = function (H, tile) {
    H.TM.closeDialog();
    var s = S(H);
    if (!(s.route.name === 'member' && s.route.id === MID)) { H.TM.reset(); H.openMember(MID); s = S(H); }
    if (tile) H.selectTile(MID, PROG); else { delete s.tile[MID]; s.expanded = null; H.TM.render(); }
  };
  K.ensureAdd = function (H, svc) {
    var s = S(H);
    if (!(s.route.name === 'add' && s.route.id === MID)) { K.ensureMember(H, true); K.begin(H); s = S(H); }
    s.form.svc = !!svc; s.form.svcOpen = false; s.form.msOpen = null; H.TM.render();
  };

  /* fill any still-empty answers with samples, for question groups 0..upTo. upTo >= GROUPS.length also sets the hours. */
  K.fill = function (H, upTo) {
    var f = S(H).form, a = f.answers;
    for (var g = 0; g <= upTo && g < GROUPS.length; g++) GROUPS[g].forEach(function (k) {
      var v = a[k]; if (!v || (Array.isArray(v) && !v.length)) { var sv = K.sample(H, k); if (sv !== undefined) a[k] = sv; }
    });
    if (upTo >= GROUPS.length && !f.qty) f.qty = QTY;
    f.error = ''; H.TM.render();
  };
  K.ensureForm = function (H, upTo) { K.ensureAdd(H, true); K.fill(H, upTo); };

  K.answered = function (H, keys) { var a = S(H).form.answers; return keys.every(function (k) { var v = a[k]; return v && (!Array.isArray(v) || v.length); }); };
  K.missing = function (H, keys) { var a = S(H).form.answers; for (var i = 0; i < keys.length; i++) { var v = a[keys[i]]; if (!v || (Array.isArray(v) && !v.length)) return H.q('#q-' + keys[i]); } return null; };
  K.clear = function (H, keys) { var a = S(H).form.answers; keys.forEach(function (k) { delete a[k]; }); H.TM.render(); };

  /* build up to the cart, or all the way through checkout, the same way the learner would */
  K.buildCart = function (H) { H.TM.reset(); H.openMember(MID); H.selectTile(MID, PROG); K.begin(H); S(H).form.svc = true; K.fill(H, GROUPS.length); H.TM.addToCart(); };
  K.submit = function (H) { K.buildCart(H); H.TM.doCheckout(); H.q('#confirmCo').click(); };
  K.newRef = function (H) { var today = H.TM.CONFIG.today; return H.member(MID).referrals.filter(function (r) { return r.program === PROG && r.received === today; })[0]; };
  K.cartHas = function (H) { return H.route().name === 'cart' && S(H).cart.length > 0; };
  K.ensureCart = function (H) { if (!K.cartHas(H)) K.buildCart(H); };
  K.ensureSubmitted = function (H) {
    if (K.newRef(H) && !S(H).cart.length) { if (S(H).route.name !== 'member') H.openMember(MID); return; }
    K.submit(H);
  };

  /* "try a second one": needs a first referral that still leaves a few hours, so the one-per-period rule is what stops it */
  K.ensureFirstDone = function (H, qty2) {
    if (!K.newRef(H) || K.remaining(H) < qty2) K.submit(H);
    if (S(H).route.name !== 'member') H.openMember(MID);
    H.selectTile(MID, PROG);
  };
  K.startSecond = function (H, qty2) {
    K.ensureFirstDone(H, qty2); S(H).cart = []; K.begin(H); S(H).form.svc = true; K.fill(H, GROUPS.length); S(H).form.qty = qty2; H.TM.render();
  };
  K.secondInCart = function (H, qty2) { K.startSecond(H, qty2); H.TM.addToCart(); };
  K.checkoutFailed = function (H) { return !!H.q('.toast.err'); };
  K.failSecond = function (H, qty2) { K.secondInCart(H, qty2); H.TM.doCheckout(); H.q('#confirmCo').click(); };

  /* pieces every module's steps use */
  K.svcTarget = function (H) { return H.form() && H.form().svcOpen ? H.q('[data-pick-svc]') : H.q('#svcSearch'); };
  K.svcTag = function (label) { return function (H) { return H.form() && H.form().svcOpen ? 'Select ' + label : 'Select to search'; }; };
  K.addressCard = function (H, doc) { var h = Array.prototype.slice.call(doc.querySelectorAll('h2')).filter(function (e) { return /Service Address/.test(e.textContent); })[0]; return h ? h.parentElement : null; };
  K.confirmTarget = function (H, doc) { return doc.querySelector('#confirmCo') || doc.querySelector('#checkout'); };
  K.confirmTag = function (H) { return H.q('#confirmCo') ? 'Select Confirm' : 'Select Checkout'; };
  K.submittedDone = function (H) { return H.route().name === 'member' && !!K.newRef(H) && S(H).cart.length === 0; };
  K.expandNew = function (H) { K.ensureSubmitted(H); H.selectTile(MID, PROG); S(H).expanded = K.newRef(H).id; H.TM.render(); };
  K.newRefTarget = function (H, doc) { return doc.querySelector('.exp') || doc.querySelector('tr[data-expand]'); };
  return K;
};
