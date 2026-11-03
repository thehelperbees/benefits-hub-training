/* Recovery at Home, Module 4: Create the referral.
   Follows the SME mockup's Scenario 1 ("Refer a member to Recovery at Home", member TEST-1001).
   `say` is the narration script (recorded separately); `sub` is the on-screen caption.
   Every fact below comes from the SME mockup (Aetna Benefits Hub Training Mock). */
(function () {
  var MID = 'TEST-1001', RAH = 'RAH60', PC = 'IHSPC80';

  /* ---- state helpers: put the embedded app into the state a step expects (used when the learner goes Back) ---- */
  function S(H) { return H.TM.S; }
  function ensureMember(H, tile) {
    var s = S(H);
    if (!(s.route.name === 'member' && s.route.id === MID)) { H.TM.reset(); H.openMember(MID); s = S(H); }
    if (tile) H.selectTile(MID, RAH); else { delete s.tile[MID]; s.expanded = null; H.TM.render(); }
  }
  function ensureAdd(H, svc) {
    var s = S(H);
    if (!(s.route.name === 'add' && s.route.id === MID)) { ensureMember(H, true); H.startAdd(MID, RAH); s = S(H); }
    s.form.svc = !!svc; s.form.svcOpen = false; s.form.msOpen = null; H.TM.render();   // also closes any open multi-select list so it can't cover the next question
  }
  function fill(H, upTo) {            // fill any still-empty answers with sample data, up to question group N
    var f = S(H).form, a = f.answers, dx = H.sdqOptions('dx');
    function put(k, v) { if (!a[k] || (Array.isArray(a[k]) && !a[k].length)) a[k] = v; }
    if (upTo >= 1) { put('bestNumber', '555-0111'); put('pp1_name', 'Pat Sample'); put('pp1_rel', 'Point of Contact (POC) / family'); put('pp1_phi', 'Yes - PHI may be shared'); }
    if (upTo >= 2) { put('hospital', 'Sample Regional Hospital'); put('anticipatedDischarge', '2027-03-11'); put('careNeeded', '2027-03-12'); }
    if (upTo >= 3) { put('dx', dx[0]); }
    if (upTo >= 4) { put('supportNeeds', ['ADL: Bathing & personal hygiene']); }
    if (upTo >= 5 && !f.qty) f.qty = 60;
    f.error = ''; H.TM.render();
  }
  function ensureForm(H, upTo) { ensureAdd(H, true); fill(H, upTo); }
  function buildCart(H) { H.TM.reset(); H.openMember(MID); H.selectTile(MID, RAH); H.startAdd(MID, RAH); S(H).form.svc = true; fill(H, 5); H.TM.addToCart(); }
  function hasRAH(H) { return H.member(MID).referrals.some(function (r) { return r.program === RAH; }); }
  function ensureSubmitted(H) {
    if (hasRAH(H) && S(H).cart.length === 0) { if (S(H).route.name !== 'member') H.openMember(MID); return; }
    buildCart(H); H.TM.doCheckout(); H.q('#confirmCo').click();
  }
  function newRef(H) { return H.member(MID).referrals.filter(function (r) { return r.program === RAH; })[0]; }
  function missingFirst(H, keys, sels) { var a = S(H).form.answers; for (var k = 0; k < keys.length; k++) { var v = a[keys[k]]; if (!v || (Array.isArray(v) && !v.length)) return H.q(sels[k]); } return null; }
  function has(H, keys) { var a = S(H).form.answers; return keys.every(function (k) { var v = a[k]; return v && (!Array.isArray(v) || v.length); }); }
  function authSel(H, prog) { return H.authId(MID, prog); }

  window.GUIDE_CONFIG = {
    engine: '../engine/bh-mock.html',
    logo: '../assets/img/bee-icon.png',
    finishHref: '../Begin-Training.html',
    scenarios: ['Refer a member to Recovery at Home', 'Recovery at Home: once per diagnosis'],   // SME scenarios that belong to this training: "Refer a member to Recovery at Home" and "Recovery at Home: once per diagnosis"

    cover: {
      badge: 'Benefits Hub',
      title: 'Create a Recovery at Home Referral',
      sub: 'Recovery at Home gives a member in-home help after an acute inpatient stay for a qualifying diagnosis. In this module you will create one for a training member, from search to checkout, on the real Benefits Hub screens.',
      meta: [['~15 minutes', 'self-paced'], ['60 hours', 'per qualifying diagnosis']],
      au: 'rah4_00_cover.mp3',
      say: 'Recovery at Home is for members coming home after an acute hospital stay for a qualifying diagnosis. It\'s the most involved referral you\'ll create, so we\'ll take it step by step. By the end, you\'ll have created one from start to finish: finding the member, setting the service address, answering the questions, setting the hours, checking out, and seeing what happens to the member\'s personal care. Everything here uses a training member, so nothing is real.'
    },

    steps: [
      { id: 'search', au: 'rah4_01_search.mp3',
        h: 'Find the member',
        sub: 'Type the training member number <b>TEST-1001</b> in the search box and press Enter.',
        say: 'Every referral starts with the member. Click the search box, type the member number, test dash one zero zero one, and press Enter. We\'ll use this same training member for the whole module.',
        enter: function (H) { H.TM.reset(); H.TM.go({ name: 'home' }); },
        target: '#memberSearch', tag: 'Type TEST-1001',
        done: function (H) { var r = H.route(); return r.name === 'member' && r.id === MID; } },

      { id: 'tile', au: 'rah4_02_tile.mp3',
        h: 'Open the Recovery at Home benefit',
        sub: 'This member has two benefits: In-Home Support Personal Care and Recovery at Home. Select the <b>Recovery at Home</b> tile.',
        say: 'This member has two benefits on their plan, personal care and Recovery at Home. Each has its own tile, and you always create a referral from the tile for the benefit you want. Here we want Recovery at Home, so click that tile.',
        enter: function (H) { ensureMember(H, false); },
        target: '.tile[title="Recovery at Home"]', tag: 'Select this benefit',
        done: function (H) { return S(H).tile[MID] === authSel(H, RAH); } },

      { id: 'auth', au: 'rah4_03_auth.mp3',
        h: 'Check the authorization, then add a referral',
        sub: 'The authorization shows the <b>Plan Allowance</b> (60 hours), what is <b>Used</b>, what is <b>Pending</b>, and what is <b>Remaining</b>. This member has no Recovery at Home referrals yet. Select <b>Add Referral</b>.',
        say: 'Below the tile is the authorization. Recovery at Home allows sixty hours, and none are used or pending, so all sixty are available. Notice there are no Recovery at Home referrals yet, which is what we expect, because we\'re about to create the first one. Click Add Referral.',
        enter: function (H) { ensureMember(H, true); },
        target: '[data-add-ref]', tag: 'Select Add Referral',
        done: function (H) { return H.route().name === 'add'; } },

      { id: 'hold-notice', au: 'rah4_04_hold.mp3', info: true,
        h: 'Read the Personal Care notice',
        sub: 'This member has an open Personal Care referral, so Benefits Hub shows a notice. <b>Recovery at Home hours apply first.</b> When you submit this referral, the Personal Care referral goes on hold and resumes when Recovery at Home ends.',
        say: 'Before anything else, Benefits Hub shows a notice, and it\'s an important one. This member already has an open personal care referral, and Recovery at Home takes priority. When you submit this referral, the personal care referral automatically goes on hold, and then picks back up when Recovery at Home ends. You won\'t have to manage that yourself, but it\'s good to know, so you can explain it if the member or their family asks.',
        enter: function (H) { ensureAdd(H, false); },
        target: '.alert.warn', tag: 'Read this notice' },

      { id: 'address', au: 'rah4_04b_address.mp3',
        h: 'Care somewhere other than home?',
        sub: 'Before you choose the service, check <b>where care will take place</b>. If the member will receive care somewhere other than their home, select <b>(change service address)</b> and enter that address. Here the member is recovering at a relative\'s home: <b>12 Sample Road, Faketon, FL 33101</b>. Services refresh for the new location, and the address carries through to checkout. <b>After checkout it cannot be edited.</b>',
        say: 'Next, a step people often skip: check where care will actually happen. By default, Benefits Hub uses the member\'s address on file. But sometimes care happens somewhere else, like when a member recovers at a family member\'s home. If that\'s the case, click change service address and enter that address. Do it now, before you choose a service, because the services available depend on where care will take place. A few rules to remember. You can use only one alternative address per checkout, the address on the member\'s record doesn\'t change, and once you check out, the address can\'t be edited. So take a moment to get it right. In this example, enter twelve Sample Road, Faketon, Florida, three three one zero one.',
        enter: function (H) { ensureAdd(H, false); },
        target: function (H, doc) {
          if (doc.querySelector('#saveAddr')) {
            var m = H.member(MID), a1 = doc.querySelector('#a1'), a3 = doc.querySelector('#a3'), a4 = doc.querySelector('#a4'), a5 = doc.querySelector('#a5');
            if (a1.value === m.addr) return a1; if (a3.value === m.city) return a3; if (a4.value === m.state) return a4; if (a5.value === m.zip) return a5;
            return doc.querySelector('#saveAddr');
          }
          return doc.querySelector('[data-addr]'); },
        tag: function (H) {
          if (!H.q('#saveAddr')) return 'Select to change';
          var m = H.member(MID);
          if (H.q('#a1').value === m.addr) return 'Enter the street address'; if (H.q('#a3').value === m.city) return 'Enter the city';
          if (H.q('#a4').value === m.state) return 'Enter the state'; if (H.q('#a5').value === m.zip) return 'Enter the zip code'; return 'Select Save'; },
        done: function (H) { var f = H.form(); return !!(f && f.addr !== H.member(MID).addr); } },

      { id: 'service', au: 'rah4_05_service.mp3',
        h: 'Choose the service',
        sub: 'Select the <b>Search For Services</b> field, then choose <b>Recovery at Home</b>.',
        say: 'Now choose the service. Click the Search For Services box, and pick Recovery at Home from the list. As soon as you do, the service questions appear below, and those questions are how the Helper Bees get what they need to arrange care for this member.',
        enter: function (H) { ensureAdd(H, false); },
        target: function (H) { return H.form() && H.form().svcOpen ? H.q('[data-pick-svc]') : H.q('#svcSearch'); },
        tag: function (H) { return H.form() && H.form().svcOpen ? 'Select Recovery at Home' : 'Select to search'; },
        done: function (H) { return !!(H.form() && H.form().svc); } },

      { id: 'contact', au: 'rah4_06_contact.mp3',
        h: 'Who should THB work with?',
        sub: 'Under <b>Service Questions</b>, enter the <b>best number to reach the member</b> and <b>point person 1</b>: name, relationship to the member, and whether PHI can be shared with them. Optional fields can be left blank, and you can add point persons 2 and 3 if the member has them.',
        say: 'The first questions are about who the Helper Bees should work with. Start with the best number to reach the member. A mobile is ideal, since the phone on file comes from Aetna\'s eligibility file. Then fill in point person one: their name, how they\'re related to the member, and whether health information can be shared with them. That last question matters, because it tells the Helper Bees whether they can discuss the member\'s care with that person. The email and phone details are optional, and you can add a second and third point person if the member has more than one contact.',
        enter: function (H) { ensureForm(H, 0); },
        target: function (H) { return missingFirst(H, ['bestNumber', 'pp1_name', 'pp1_rel', 'pp1_phi'], ['#q-bestNumber', '#q-pp1_name', '#q-pp1_rel', '#q-pp1_phi']); },
        tag: 'Answer this question',
        done: function (H) { return has(H, ['bestNumber', 'pp1_name', 'pp1_rel', 'pp1_phi']); } },

      { id: 'dates', au: 'rah4_07_dates.mp3',
        h: 'Where is the member, and when is care needed?',
        sub: 'Enter the <b>current hospital or facility</b> and the <b>anticipated discharge date</b> if you know them. The anticipated date is for planning only. Then enter the <b>date care is needed</b>. It can differ from the discharge date, and THB schedules the first visit for it.',
        say: 'Now the timing questions. If you know where the member is and when they expect to go home, enter the hospital and the anticipated discharge date. Those two are for planning, and since discharge dates often move, don\'t worry about getting them perfect. The one that\'s required is the date care is needed. It can be different from the discharge date, and it\'s the date the Helper Bees schedule the first visit for, so think about when the member will actually need help.',
        enter: function (H) { ensureForm(H, 1); },
        target: '#q-careNeeded', tag: 'Required date',
        done: function (H) { return has(H, ['careNeeded']); } },

      { id: 'dx', au: 'rah4_08_dx.mp3',
        h: 'Qualifying diagnosis',
        sub: 'Choose the <b>qualifying diagnosis</b> for this referral. Recovery at Home allows one referral per qualifying diagnosis, per member, per year. You already chose Recovery at Home from the tile, so there is no N/A option here.',
        say: 'Next, the qualifying diagnosis. Pick the diagnosis that applies from the list. Recovery at Home allows one referral per qualifying diagnosis, per member, per year, so this choice matters. If the member has already had a referral for that diagnosis this year, checkout will stop you. You\'ll notice there\'s no chronic conditions question and no N-A option here. That\'s because you already chose Recovery at Home when you selected the tile.',
        enter: function (H) { ensureForm(H, 2); delete S(H).form.answers.dx; H.TM.render(); },
        target: '#q-dx', tag: 'Choose the diagnosis',
        done: function (H) { return has(H, ['dx']); } },

      { id: 'support', au: 'rah4_09_support.mp3',
        h: 'Support needs',
        sub: 'Open <b>Support needs</b> and select at least one. The list covers ADLs (daily living) and IADLs (household tasks). <b>Care interest confirmed with member?</b> is optional.',
        say: 'Now the support needs. Open the list and choose at least one. The options include activities of daily living, like bathing and dressing, and household help, like meals and laundry. Pick what this member will really need, because providers are pointed to these answers for care guidance. The care interest question below is optional.',
        enter: function (H) { ensureForm(H, 3); delete S(H).form.answers.supportNeeds; H.TM.render(); },
        target: '#q-supportNeeds', tag: 'Open and choose',
        done: function (H) { return has(H, ['supportNeeds']); } },

      { id: 'narrative', au: 'rah4_09b_narrative.mp3', info: true,
        h: 'Add a referral narrative (optional)',
        sub: 'You can write a <b>referral narrative</b> of up to 250 characters. Because Recovery at Home has service questions, Benefits Hub adds a first line telling providers to review them. That line counts toward the 250, so the counter stops lower. You can edit the narrative after the referral is created.',
        say: 'Here\'s something you can do right on this form: write a referral narrative, up to two hundred fifty characters. Use it for anything that helps whoever picks up this referral and isn\'t covered by the questions above. Because Recovery at Home has service questions, Benefits Hub adds a first line for you, telling providers to review those answers. That line counts toward the two hundred fifty, which is why your counter stops lower. It\'s optional, and you can edit it later.',
        enter: function (H) { ensureForm(H, 4); },
        target: '#narrAdd', tag: 'Optional' },

      { id: 'hours', au: 'rah4_10_hours.mp3',
        h: 'Enter the hours',
        sub: 'Enter <b>60</b> hours, the full Recovery at Home allowance for this diagnosis. For these Aetna programs <b>1 point = 1 hour</b>, so Total Points shows hours. Read the note below: until a discharge date is recorded, the referral expires 30 days after submission. It never runs past 12/31.',
        say: 'Under Order Details, enter sixty for the quantity. That\'s the full Recovery at Home allowance for this diagnosis. For these Aetna programs, one point equals one hour, so when you see total points, read it as total hours. Now read the note under the quantity, because it answers a common question: when does this referral expire? Until a discharge date is recorded, it expires thirty days after you submit it, and never later than December thirty-first. When you record the discharge date later, the expiration moves to thirty days after the member goes home.',
        enter: function (H) { ensureForm(H, 4); delete S(H).form.qty; H.TM.render(); },
        target: '#qty', tag: 'Enter 60',
        done: function (H) { var f = S(H).form; return !!(f && f.qty >= 1); } },

      { id: 'cart', au: 'rah4_11_cart.mp3',
        h: 'Add it to the cart',
        sub: 'When every required question is answered, <b>Add to Cart</b> turns on. Select it.',
        say: 'Everything required is answered, so the Add to Cart button is active. Click it. If it\'s ever not active, a required question is still missing, so scroll up and look for the red asterisk.',
        enter: function (H) { ensureForm(H, 5); },
        target: '#addToCart', tag: 'Select Add to Cart',
        done: function (H) { return H.route().name === 'cart'; } },

      { id: 'review', au: 'rah4_12_review.mp3', info: true,
        h: 'Review the Referrals Summary',
        sub: 'Check the quantity and the <b>Service Address</b>. This is where the referral will route. <b>You can\'t edit the address here.</b> If it is wrong, remove the item with the trash icon, go back, and change the address on the Add Referral screen before you check out. After checkout it cannot be edited. The eye icon lets you review the question answers.',
        say: 'This is the Referrals Summary, your last stop before submitting. Check the quantity, then look closely at the service address, because that\'s where the referral will route. You can\'t edit the address on this screen. If it\'s wrong, remove the item with the trash icon, go back, and change the address on the Add Referral screen before you check out. After checkout, it can\'t be edited at all. The eye icon lets you double-check the answers you gave to the service questions.',
        enter: function (H) { if (!(H.route().name === 'cart' && S(H).cart.length)) buildCart(H); },
        target: function (H, doc) { var h = Array.prototype.slice.call(doc.querySelectorAll('h2')).filter(function (e) { return /Service Address/.test(e.textContent); })[0]; return h ? h.parentElement : null; },
        tag: 'Verify the address' },

      { id: 'checkout', au: 'rah4_13_checkout.mp3',
        h: 'Check out and confirm',
        sub: 'Select <b>Checkout</b>. Benefits Hub asks you to confirm. THB will contact the member or their point person to confirm interest before any provider outreach. Select <b>Confirm</b>.',
        say: 'Click Checkout, then Confirm. When you confirm, the referral is submitted. Next, the Helper Bees reach out to the member or their point person to confirm they\'re interested, before any provider is contacted.',
        enter: function (H) { if (!(H.route().name === 'cart' && S(H).cart.length)) buildCart(H); },
        target: function (H, doc) { return doc.querySelector('#confirmCo') || doc.querySelector('#checkout'); },
        tag: function (H) { return H.q('#confirmCo') ? 'Select Confirm' : 'Select Checkout'; },
        done: function (H) { return H.route().name === 'member' && hasRAH(H) && S(H).cart.length === 0; } },

      { id: 'after', au: 'rah4_14_after.mp3', info: true,
        h: 'See the new referral',
        sub: 'The referral is on the member page with status <b>New</b> and no provider yet. <b>Expires</b> shows a date 30 days after submission. When you record the discharge date in the Managing a Referral module, it moves to 30 days after discharge.',
        say: 'Your referral now appears on the member page with the status New, which means it\'s been created and is waiting to move forward. No provider is assigned yet. Look at the expiration date: for now, it\'s thirty days after submission. When you record the discharge date, that changes to thirty days after the member goes home. Recording that date is what you\'ll learn to do in the Managing a Referral module.',
        enter: function (H) { ensureSubmitted(H); H.selectTile(MID, RAH); S(H).expanded = newRef(H).id; H.TM.render(); },
        target: function (H, doc) { return doc.querySelector('.exp') || doc.querySelector('tr[data-expand]'); },
        tag: 'Your new referral' },

      { id: 'pc-tile', au: 'rah4_15_pctile.mp3',
        h: 'Check the Personal Care benefit',
        sub: 'Select the <b>In-Home Support Personal Care</b> tile to see what happened to that referral.',
        say: 'Now let\'s see what that referral did to the member\'s personal care. Click the personal care tile.',
        enter: function (H) { ensureSubmitted(H); H.selectTile(MID, RAH); },
        target: '.tile[title="In-Home Support Personal Care"]', tag: 'Select this benefit',
        done: function (H) { return S(H).tile[MID] === authSel(H, PC); } },

      { id: 'pc-hold', au: 'rah4_16_pchold.mp3', info: true,
        h: 'The Personal Care referral is on hold',
        sub: 'Its status is now <b>On Hold</b>, and it resumes when Recovery at Home ends. Nothing is lost: the hold is automatic and you do not need to do anything.',
        say: 'There it is. The personal care referral now shows On Hold, and the details say it resumes when Recovery at Home ends. That happened automatically, and you don\'t need to touch the personal care referral. This is worth remembering for conversations with families: personal care isn\'t canceled, it\'s paused while Recovery at Home runs.',
        enter: function (H) { ensureSubmitted(H); H.selectTile(MID, PC); var pc = H.member(MID).referrals.filter(function (r) { return r.program === PC; })[0]; if (pc) S(H).expanded = pc.id; H.TM.render(); },
        target: '.chip.hold', tag: 'On Hold' }
    ],

    outro: {
      eyebrow: 'All set',
      title: 'You created a Recovery at Home referral.',
      sub: 'You searched for the member, chose the benefit, answered the service questions, set 60 hours, checked out, and saw the Personal Care referral go on hold. Next you will create Post-Discharge referrals. Later, in Managing a Referral, you will record the discharge date, which moves the expiration to 30 days after discharge.',
      links: [{ href: '../resources/Adding a Referral - Job Aid.pdf', label: 'Job aid: Adding a Referral' },{ href: '../resources/Aetna Benefits at a Glance - Job Aid.pdf', label: 'Job aid: Aetna Benefits at a Glance' }],
      au: 'rah4_17_outro.mp3',
      say: 'You\'ve created a Recovery at Home referral from start to finish. You found the member, chose the right benefit, set the service address, answered the questions, set sixty hours, checked out, and saw how it puts personal care on hold. The Adding a Referral job aid and the Aetna Benefits at a Glance sheet are linked here, to keep handy. Next up, post-discharge referrals, which have a couple of twists of their own.'
    }
  };
})();
