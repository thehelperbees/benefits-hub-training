/* Personal Care: create the referral. Member TEST-1002 (IHSPC80, no Personal Care referral yet).
   Questions follow the final SME mock: best number, point person(s), support needs (ADLs, at least 2; IADLs optional),
   care interest, narrative. `say` = narration script, `sub` = on-screen caption. */
(function () {
  var K = GuideKit({
    member: 'TEST-1002', program: 'IHSPC80', qty: 80,
    groups: [['bestNumber', 'pp1_name', 'pp1_rel', 'pp1_phi'], ['adlNeeds']]
  });
  var S = K.S, MID = K.MID;
  /* a second referral in the same year: the first one used the whole 80-point allotment, so Add to Cart is refused */
  function blocked(H) { var f = S(H).form; return !!(f && /Insufficient points/.test(f.error || '')); }
  function startSecond(H) {
    if (!K.newRef(H)) K.submit(H);
    S(H).cart = []; if (S(H).route.name !== 'member') H.openMember(MID); H.selectTile(MID, 'IHSPC80');
    K.begin(H); S(H).form.svc = true; K.fill(H, K.GROUPS.length); H.TM.render();
  }
  function errBox(H, doc) { return Array.prototype.slice.call(doc.querySelectorAll('.alert.warn')).filter(function (e) { return /Insufficient points/.test(e.textContent); })[0] || doc.querySelector('#addToCart'); }

  window.GUIDE_CONFIG = {
    engine: '../engine/bh-mock.html',
    logo: '../assets/img/bee-icon.png',
    finishHref: '../Begin-Training.html',
    scenarios: ['Create a Personal Care referral'],

    cover: {
      badge: 'Benefits Hub',
      title: 'Create a Personal Care Referral',
      sub: 'Personal Care gives a member help with activities of daily living at home, with a yearly allotment of hours. In this module you will create one for a training member, from search to checkout, on the real Benefits Hub screens.',
      meta: [['~12 minutes', 'self-paced'], ['One per year', 'per member, per plan']],
      au: 'pc_00_cover.mp3',
      say: 'Personal care gives a member help with everyday activities at home, from a yearly allotment of hours. Compared with Recovery at Home and post-discharge, it\'s simpler, because it isn\'t tied to a hospital stay. In this module, you\'ll create a personal care referral, and then see the one rule that catches people out: a member gets one personal care referral per year, per plan. You\'ll use a training member, so nothing here is real.'
    },

    steps: [
      { id: 'search', au: 'pc_01_search.mp3',
        h: 'Find the member',
        sub: 'Type the training member number <b>TEST-1002</b> in the search box and press Enter.',
        say: 'Search for the member: test dash one zero zero two. Type it in, and press Enter.',
        enter: function (H) { H.TM.reset(); H.TM.go({ name: 'home' }); },
        target: '#memberSearch', tag: 'Type TEST-1002',
        done: function (H) { var r = H.route(); return r.name === 'member' && r.id === MID; } },

      { id: 'tile', au: 'pc_02_tile.mp3',
        h: 'Open the Personal Care benefit',
        sub: 'This member has two benefits: In-Home Support Personal Care and In-Home Support Post-Discharge. Select the <b>In-Home Support Personal Care</b> tile.',
        say: 'This member has personal care and post-discharge. Click the personal care tile, since that\'s the benefit we\'re setting up.',
        enter: function (H) { K.ensureMember(H, false); },
        target: '.tile[title="In-Home Support Personal Care"]', tag: 'Select this benefit',
        done: function (H) { return S(H).tile[MID] === H.authId(MID, K.PROG); } },

      { id: 'auth', au: 'pc_03_auth.mp3',
        h: 'Check the authorization, then add a referral',
        sub: 'On this plan the <b>Plan Allowance</b> is 80 hours. Nothing is <b>Used</b> or <b>Pending</b>, so all 80 are <b>Remaining</b>. Personal Care allows one referral per member per year, per plan, and this member has none yet. Select <b>Add Referral</b>.',
        say: 'Below the tile is the authorization. On this plan, the allowance is eighty hours, and none are used or pending, so all eighty are available. This member doesn\'t have a personal care referral yet, and that matters, because personal care allows only one referral per member, per year, per plan. So you want to get this one right. Click Add Referral.',
        enter: function (H) { K.ensureMember(H, true); },
        target: '[data-add-ref]', tag: 'Select Add Referral',
        done: function (H) { return H.route().name === 'add'; } },

      { id: 'address', au: 'pc_03b_address.mp3', info: true,
        h: 'Where will care take place?',
        sub: 'Before you choose the service, check <b>where care will take place</b>. If it is somewhere other than the address on file, select <b>(change service address)</b> and enter that address. Services refresh for the new location. <b>After checkout the address cannot be edited.</b>',
        say: 'Before you choose the service, think about where care will take place. If it\'s the member\'s home, you\'re set. If it\'s somewhere else, click change service address and enter it now. The services available depend on that location, and once you check out, the address can\'t be edited.',
        enter: function (H) { K.ensureAdd(H, false); },
        target: '[data-addr]', tag: 'Change service address' },

      { id: 'service', au: 'pc_04_service.mp3',
        h: 'Choose the service',
        sub: 'Select the <b>Search For Services</b> field, then choose <b>In-Home Support - Personal Care</b>.',
        say: 'Click Search For Services, and choose in-home support, personal care.',
        enter: function (H) { K.ensureAdd(H, false); },
        target: K.svcTarget, tag: K.svcTag('Personal Care'),
        done: function (H) { return !!(H.form() && H.form().svc); } },

      { id: 'contact', au: 'pc_05_contact.mp3',
        h: 'Who should THB work with?',
        sub: 'Under <b>Service Questions</b>, enter the <b>best number to reach the member</b> and <b>point person 1</b>: name, relationship to the member, and whether PHI can be shared with them. Optional fields can be left blank, and you can add point persons 2 and 3 if the member has them.',
        say: 'These questions tell the Helper Bees who to work with. Enter the best number to reach the member, and a mobile is best, since the phone on file comes from Aetna\'s eligibility file. Then complete point person one: name, relationship, and whether health information can be shared with them. Email, other phone numbers, and best time to reach are optional, and you can add more point persons if the member has them.',
        enter: function (H) { K.ensureForm(H, -1); },
        target: function (H) { return K.missing(H, ['bestNumber', 'pp1_name', 'pp1_rel', 'pp1_phi']); }, tag: 'Answer this question',
        done: function (H) { return K.answered(H, ['bestNumber', 'pp1_name', 'pp1_rel', 'pp1_phi']); } },

      { id: 'adl', au: 'pc_06_adl.mp3',
        h: 'Support needs: activities of daily living',
        sub: 'Open the first <b>Support needs</b> list and select <b>at least two</b> activities of daily living (ADLs). Personal Care requires help with at least two, and Benefits Hub will not let you continue with fewer.',
        say: 'Now the support needs, which is where personal care has a rule of its own. The first list is activities of daily living, or A-D-Ls: bathing and personal hygiene, dressing and grooming, toileting and continence, transfer assistance, ambulation and mobility, and feeding assistance. Select at least two. Personal care requires help with two or more, and Benefits Hub won\'t let you continue with fewer.',
        enter: function (H) { K.ensureForm(H, 0); K.clear(H, ['adlNeeds']); },
        target: '#q-adlNeeds',
        tag: function (H) { var a = S(H).form.answers.adlNeeds; return a && a.length === 1 ? 'Select at least one more' : 'Open and choose'; },
        done: function (H) { var a = S(H).form.answers.adlNeeds; return !!(a && a.length >= 2); } },

      { id: 'iadl', au: 'pc_07_iadl.mp3', info: true,
        h: 'Optional: other support and care interest',
        sub: 'The second <b>Support needs</b> list covers instrumental ADLs, like meal preparation, medication reminders, light housekeeping, and laundry. Choose any that apply. <b>Care interest confirmed with member?</b> is optional too. If you choose "Other," describe it in the referral narrative.',
        say: 'The second list is for other support, called I-A-D-Ls. These are things like meal preparation, medication reminders, light housekeeping, laundry, errands, and transportation help. Choose any that apply, but it\'s optional. If none of the choices fit, pick Other, and describe it in the referral narrative, which is next. The care interest question is optional too.',
        enter: function (H) { K.ensureForm(H, 1); },
        target: '#q-iadlNeeds', tag: 'Optional' },

      { id: 'narrative', au: 'pc_08_narrative.mp3', info: true,
        h: 'Add a referral narrative (optional)',
        sub: 'You can write a <b>referral narrative</b> of up to 250 characters. Because Personal Care has service questions, Benefits Hub adds a first line telling providers to review them. That line counts toward the 250, so the counter stops lower. You can edit the narrative after the referral is created.',
        say: 'The referral narrative is optional, up to two hundred fifty characters. It\'s the place to explain anything the questions don\'t capture, like the details of an Other support need. Benefits Hub adds a first line asking providers to review the service questions, and that counts toward your two hundred fifty. You can edit it anytime after the referral is created.',
        enter: function (H) { K.ensureForm(H, 1); },
        target: '#narrAdd', tag: 'Optional' },

      { id: 'hours', au: 'pc_09_hours.mp3', info: true,
        h: 'Check the order details',
        sub: 'Under <b>Order Details</b>, <b>Quantity</b> is <b>1</b> and <b>Total Points</b> is <b>80</b>. Every Aetna referral is one item that costs the full allotment, so this one referral covers the member\'s 80 hours for the year. There is nothing to type. Read the note below: the referral expires at the end of the plan year, and hours don\'t roll over.',
        say: 'Look at Order Details. The quantity is one, and total points is eighty. Every Aetna referral works like a gift card: the member has eighty hours to spend this year, and this one referral uses all eighty. So there\'s nothing for you to type, and this is the member\'s one personal care referral for the year. Read the note under the order details too: it expires at the end of the plan year, December thirty-first, and unused hours don\'t roll over.',
        enter: function (H) { K.ensureForm(H, 1); },
        target: function (H, doc) { return doc.querySelector('.order'); }, tag: '1 item, 80 points' },

      { id: 'cart', au: 'pc_10_cart.mp3',
        h: 'Add it to the cart',
        sub: 'When every required question is answered, <b>Add to Cart</b> turns on. Select it.',
        say: 'The required questions are answered, so Add to Cart is active. Click it.',
        enter: function (H) { K.ensureForm(H, K.GROUPS.length); },
        target: '#addToCart', tag: 'Select Add to Cart',
        done: function (H) { return H.route().name === 'cart'; } },

      { id: 'review', au: 'pc_11_review.mp3', info: true,
        h: 'Review the Referrals Summary',
        sub: 'Check the quantity and the <b>Service Address</b>. This is where the referral will route. <b>You can\'t edit the address here.</b> If it is wrong, remove the item with the trash icon, go back, and change the address on the Add Referral screen before you check out. After checkout it cannot be edited. The eye icon lets you review the question answers.',
        say: 'This is the Referrals Summary. Check the quantity, and then check the service address, because that\'s where the referral will route. You can\'t edit the address here. If it\'s wrong, remove the item with the trash icon, go back, and change it on the Add Referral screen before you check out. After checkout, it can\'t be edited. The eye icon lets you review your answers.',
        enter: function (H) { K.ensureCart(H); },
        target: K.addressCard, tag: 'Verify the address' },

      { id: 'checkout', au: 'pc_12_checkout.mp3',
        h: 'Check out and confirm',
        sub: 'Select <b>Checkout</b>. Benefits Hub asks you to confirm. THB will contact the member or their point person to confirm interest before any provider outreach. Select <b>Confirm</b>.',
        say: 'Click Checkout, then Confirm. After you confirm, the Helper Bees contact the member or their point person to confirm interest before reaching out to any provider.',
        enter: function (H) { K.ensureCart(H); },
        target: K.confirmTarget, tag: K.confirmTag,
        done: K.submittedDone },

      { id: 'after', au: 'pc_13_after.mp3', info: true,
        h: 'See the new referral',
        sub: 'The referral is on the member page with status <b>New</b> and no provider yet. <b>Expires</b> shows 12/31/2027, the end of the plan year. Unlike Recovery at Home, Personal Care has no discharge date to record.',
        say: 'The referral is on the member page with the status New and no provider yet. The expiration is December thirty-first, the end of the plan year. And unlike Recovery at Home, personal care has no discharge date to record, so there\'s nothing else to enter.',
        enter: function (H) { K.expandNew(H); },
        target: K.newRefTarget, tag: 'Your new referral' },

      { id: 'second-add', au: 'pc_14_second_add.mp3',
        h: 'Try a second referral this year',
        sub: 'Personal Care allows one referral per member per year, per plan. To see what happens when you try for a second one, select <b>Add Referral</b> again.',
        say: 'Now let\'s test the rule we mentioned. Personal care allows one referral per member, per year, per plan. Click Add Referral again, and see what happens when you try for a second.',
        enter: function (H) { if (!K.newRef(H)) K.submit(H); if (S(H).route.name !== 'member') H.openMember(MID); H.selectTile(MID, 'IHSPC80'); S(H).expanded = null; H.TM.render(); },
        target: '[data-add-ref]', tag: 'Select Add Referral',
        done: function (H) { return H.route().name === 'add'; } },

      { id: 'second-cart', au: 'pc_15_second_cart.mp3',
        h: 'Try to add it to the cart',
        sub: 'We filled in the questions for you. Notice <b>Total Points</b> is 80 again. Select <b>Add to Cart</b>.',
        say: 'This time we\'ve filled in the questions for you. Notice the total points: eighty again. Click Add to Cart.',
        enter: function (H) { if (!(H.route().name === 'add' && S(H).form && S(H).form.svc)) startSecond(H); },
        target: '#addToCart', tag: 'Select Add to Cart',
        done: blocked },

      { id: 'second-read', au: 'pc_17_second_read.mp3', info: true,
        h: 'Read the message',
        sub: 'Benefits Hub stops it: <b>Insufficient points: this referral costs 80 points and 0 are available.</b> The first referral already used the member\'s full 80 points for the year. That is the one-referral-per-year rule in action.',
        say: 'There\'s the message: insufficient points. The first referral already used the member\'s full eighty points for the year, so there\'s nothing left for a second one. That\'s the one referral per year rule in action. If you ever see this on a personal care referral, look at the existing referral first.',
        enter: function (H) { if (!blocked(H)) { startSecond(H); H.TM.addToCart(); } },
        target: errBox, tag: 'Insufficient points' }
    ],

    outro: {
      eyebrow: 'All set',
      title: 'You created a Personal Care referral.',
      sub: 'You searched for the member, chose the benefit, answered the questions including at least two ADLs, added the referral for the full allotment, and checked out. You also saw Benefits Hub stop a second Personal Care referral in the same year.',
      links: [{ href: '../resources/Adding a Referral - Job Aid.pdf', label: 'Job aid: Adding a Referral' },{ href: '../resources/Aetna Benefits at a Glance - Job Aid.pdf', label: 'Job aid: Aetna Benefits at a Glance' }],
      au: 'pc_18_outro.mp3',
      say: 'You\'ve created a personal care referral, including the at-least-two A-D-Ls rule, and you\'ve seen Benefits Hub block a second one in the same year. The Adding a Referral job aid and the benefits at a glance sheet are linked here. Next, companion care.'
    }
  };
})();
