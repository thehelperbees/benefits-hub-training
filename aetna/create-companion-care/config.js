/* Companion Care: create the referral. Member TEST-1006 (CC40, no Companion Care referral yet).
   Added by the training team: the SME mock's other Companion Care member (TEST-1003) already has an open referral.
   Questions follow the final SME mock: six required open-text facility questions + required SSBCI condition (at least one of 7),
   care interest (optional), narrative (optional). `say` = narration script, `sub` = on-screen caption. */
(function () {
  var K = GuideKit({
    member: 'TEST-1006', program: 'CC40', qty: 8,
    groups: [['facility', 'facilityContact'], ['facilityPhone'], ['prefDates', 'prefTimes'], ['facilityRules'], ['ssbci']]
  });
  var S = K.S, MID = K.MID, Q2 = 4;

  window.GUIDE_CONFIG = {
    engine: '../engine/bh-mock.html',
    logo: '../assets/img/bee-icon.png',
    finishHref: '../Begin-Training.html',
    scenarios: ['Create a Companion Care referral', 'Companion care: one referral per quarter'],

    cover: {
      badge: 'Benefits Hub',
      title: 'Create a Companion Care Referral',
      sub: 'Companion Care provides a certified companion for members who live in a partner facility. In this module you will create one for a training member. Most of its questions are about the facility, and every facility question is required.',
      meta: [['~15 minutes', 'self-paced'], ['40 hours', 'per calendar quarter']],
      au: 'cc_00_cover.mp3',
      say: 'Companion care is a different kind of referral. It provides a certified companion for members who live in a partner facility, so instead of hospital and discharge questions, you\'ll be answering questions about the facility itself. Every one of them is required, and you\'ll see why that helps the provider. You\'ll also meet a limit: one companion care referral per member, per calendar quarter. It\'s another training member, so nothing here is real.'
    },

    steps: [
      { id: 'search', au: 'cc_01_search.mp3',
        h: 'Find the member',
        sub: 'Type the training member number <b>TEST-1006</b> in the search box and press Enter.',
        say: 'Search for the member: test dash one zero zero six. Type it in, and press Enter.',
        enter: function (H) { H.TM.reset(); H.TM.go({ name: 'home' }); },
        target: '#memberSearch', tag: 'Type TEST-1006',
        done: function (H) { var r = H.route(); return r.name === 'member' && r.id === MID; } },

      { id: 'tile', au: 'cc_02_tile.mp3',
        h: 'Open the Companion Care benefit',
        sub: 'This member has one benefit. Select the <b>Companion Care</b> tile.',
        say: 'This member has one benefit, companion care. Click its tile.',
        enter: function (H) { K.ensureMember(H, false); },
        target: '.tile[title="Companion Care"]', tag: 'Select this benefit',
        done: function (H) { return S(H).tile[MID] === H.authId(MID, K.PROG); } },

      { id: 'auth', au: 'cc_03_auth.mp3',
        h: 'Check the authorization, then add a referral',
        sub: 'Companion Care is up to <b>40 hours per calendar quarter</b>, and allows one referral per member per calendar quarter. This member has no Companion Care referral yet. Select <b>Add Referral</b>.',
        say: 'Below the tile is the authorization. Companion care is up to forty hours per calendar quarter, and a member can have one referral per calendar quarter. This member doesn\'t have one yet, so we\'re good to go. Click Add Referral.',
        enter: function (H) { K.ensureMember(H, true); },
        target: '[data-add-ref]', tag: 'Select Add Referral',
        done: function (H) { return H.route().name === 'add'; } },

      { id: 'address', au: 'cc_03b_address.mp3', info: true,
        h: 'Where will care take place?',
        sub: 'Before you choose the service, check <b>where care will take place</b>. If it is somewhere other than the address on file, select <b>(change service address)</b> and enter that address. Services refresh for the new location. <b>After checkout the address cannot be edited.</b>',
        say: 'Before you choose the service, check where care will take place. If it\'s the address on file, you\'re set. If it\'s somewhere else, click change service address and enter it now. The services available depend on that location, and the address can\'t be edited after checkout.',
        enter: function (H) { K.ensureAdd(H, false); },
        target: '[data-addr]', tag: 'Change service address' },

      { id: 'service', au: 'cc_04_service.mp3',
        h: 'Choose the service',
        sub: 'Select the <b>Search For Services</b> field, then choose <b>Companion Care</b>.',
        say: 'Click Search For Services, and choose companion care.',
        enter: function (H) { K.ensureAdd(H, false); },
        target: K.svcTarget, tag: K.svcTag('Companion Care'),
        done: function (H) { return !!(H.form() && H.form().svc); } },

      { id: 'facility', au: 'cc_05_facility.mp3',
        h: 'Where does the member live?',
        sub: 'The six facility questions are open text answers, and <b>every one is required</b>. Enter the <b>name of the facility</b> where the member lives, and <b>who the provider should contact</b> there, with their name and role or title.',
        say: 'Now the facility questions. They\'re all open text, and all required. First, the name of the facility where the member lives. Then, who the provider should contact there to schedule visits, with their name and their role or title. These two answers give the provider a real person at the facility to coordinate with.',
        enter: function (H) { K.ensureForm(H, -1); },
        target: function (H) { return K.missing(H, ['facility', 'facilityContact']); }, tag: 'Answer this question',
        done: function (H) { return K.answered(H, ['facility', 'facilityContact']); } },

      { id: 'fphone', au: 'cc_06_phone.mp3',
        h: 'How can the provider reach the facility contact?',
        sub: 'Enter the <b>direct phone number and email address</b> for the facility contact.',
        say: 'Next, how the provider reaches that contact. Enter their direct phone number and their email address. Give both, since the question asks for both.',
        enter: function (H) { K.ensureForm(H, 0); },
        target: '#q-facilityPhone', tag: 'Answer this question',
        done: function (H) { return K.answered(H, ['facilityPhone']); } },

      { id: 'fdates', au: 'cc_07_dates.mp3',
        h: 'When can the provider visit?',
        sub: 'List the <b>preferred dates</b>, including every date that works. Then give the <b>preferred times or time windows</b>, for example "Morning between 8-10 AM" or "Afternoons after 1 PM."',
        say: 'Now timing. List the preferred dates for the provider to visit, and if more than one date works, include all of them. Then the preferred times or time windows, for example, morning between eight and ten, or afternoons after one. The more options you give, the easier it is for the provider to find a time that fits.',
        enter: function (H) { K.ensureForm(H, 1); },
        target: function (H) { return K.missing(H, ['prefDates', 'prefTimes']); }, tag: 'Answer this question',
        done: function (H) { return K.answered(H, ['prefDates', 'prefTimes']); } },

      { id: 'frules', au: 'cc_08_rules.mp3',
        h: 'Facility rules and restrictions',
        sub: 'Tell the provider about any <b>scheduling rules or restrictions</b> at the facility, such as visiting hours, check-in procedures, or security protocols. The question is required, so answer it even if there are none.',
        say: 'Then any rules or restrictions at the facility that the provider should know about, like visiting hours, check-in procedures, or security protocols. This question is required too. If the facility has no special rules, say so, rather than leaving it blank, because you can\'t move on without an answer.',
        enter: function (H) { K.ensureForm(H, 2); },
        target: '#q-facilityRules', tag: 'Answer this question',
        done: function (H) { return K.answered(H, ['facilityRules']); } },

      { id: 'ssbci', au: 'cc_09_ssbci.mp3',
        h: 'SSBCI chronic conditions',
        sub: 'Companion Care is an SSBCI benefit, so choose the member\'s <b>SSBCI chronic condition(s)</b>. This question is required: select at least one of the seven.',
        say: 'Last of the required questions: the S-S-B-C-I chronic conditions. Companion care is an S-S-B-C-I benefit, so you record at least one qualifying chronic condition for the member. Open the list and select at least one. The seven choices are chronic alcohol use disorder and other substance use disorders, chronic and disabling mental health conditions, chronic heart failure, chronic kidney disease, chronic lung disorders, dementia, and neurologic disorders.',
        enter: function (H) { K.ensureForm(H, 3); K.clear(H, ['ssbci']); },
        target: '#q-ssbci', tag: 'Open and choose',
        done: function (H) { return K.answered(H, ['ssbci']); } },

      { id: 'optional', au: 'cc_10_optional.mp3', info: true,
        h: 'Optional: care interest and narrative',
        sub: '<b>Care interest confirmed with member?</b> is optional. So is the <b>referral narrative</b>, up to 250 characters. Because Companion Care has service questions, Benefits Hub adds a first line telling providers to review them, and it counts toward the 250.',
        say: 'Two questions are left, and both are optional: care interest, and the referral narrative. The narrative can be up to two hundred fifty characters, and Benefits Hub adds a first line asking providers to review your answers, which counts toward the limit. Use the narrative for anything else the provider should know. You can edit it later.',
        enter: function (H) { K.ensureForm(H, 4); },
        target: '#narrAdd', tag: 'Optional' },

      { id: 'hours', au: 'cc_11_hours.mp3',
        h: 'Enter the hours',
        sub: 'Enter the number of <b>hours</b> for this referral, up to the 40 hours remaining. For these Aetna programs <b>1 point = 1 hour</b>. Read the note below: the referral expires at the end of the quarter, 3/31/2027, and hours don\'t roll over to the next quarter.',
        say: 'Under Order Details, enter the hours for this referral, up to the forty remaining. One point equals one hour. Read the note under the quantity: this referral expires at the end of the quarter, and hours don\'t roll over to the next one. So if a member has hours left on the last day of the quarter, they don\'t carry forward.',
        enter: function (H) { K.ensureForm(H, 4); delete S(H).form.qty; H.TM.render(); },
        target: '#qty', tag: 'Enter the hours',
        done: function (H) { var f = S(H).form; return !!(f && f.qty >= 1); } },

      { id: 'cart', au: 'cc_12_cart.mp3',
        h: 'Add it to the cart',
        sub: 'When every required question is answered, <b>Add to Cart</b> turns on. Select it.',
        say: 'Every required question is answered, so Add to Cart is active. Click it.',
        enter: function (H) { K.ensureForm(H, K.GROUPS.length); },
        target: '#addToCart', tag: 'Select Add to Cart',
        done: function (H) { return H.route().name === 'cart'; } },

      { id: 'review', au: 'cc_13_review.mp3', info: true,
        h: 'Review the Referrals Summary',
        sub: 'Check the quantity and the <b>Service Address</b>. This is where the referral will route. <b>You can\'t edit the address here.</b> If it is wrong, remove the item with the trash icon, go back, and change the address on the Add Referral screen before you check out. After checkout it cannot be edited. The eye icon lets you review the question answers.',
        say: 'This is the Referrals Summary. Check the quantity, and then the service address, because that\'s where the referral will route. You can\'t edit the address on this screen. If it\'s wrong, remove the item with the trash icon, go back, and change it on the Add Referral screen before you check out. After checkout, it can\'t be edited. The eye icon shows the answers you gave.',
        enter: function (H) { K.ensureCart(H); },
        target: K.addressCard, tag: 'Verify the address' },

      { id: 'checkout', au: 'cc_14_checkout.mp3',
        h: 'Check out and confirm',
        sub: 'Select <b>Checkout</b>. Benefits Hub asks you to confirm. THB will contact the member or their point person to confirm interest before any provider outreach. Select <b>Confirm</b>.',
        say: 'Click Checkout, then Confirm. After you confirm, the Helper Bees reach out to the member or their point person to confirm interest, before any provider outreach.',
        enter: function (H) { K.ensureCart(H); },
        target: K.confirmTarget, tag: K.confirmTag, done: K.submittedDone },

      { id: 'after', au: 'cc_15_after.mp3', info: true,
        h: 'See the new referral',
        sub: 'The referral is on the member page with status <b>New</b> and no provider yet. <b>Expires</b> shows 3/31/2027, the end of Q1 2027. Companion Care has no discharge date to record.',
        say: 'The referral is on the member page with the status New and no provider yet. It expires at the end of the quarter, March thirty-first in this example. And like personal care, companion care has no discharge date to record.',
        enter: function (H) { K.expandNew(H); },
        target: K.newRefTarget, tag: 'Your new referral' },

      { id: 'second-add', au: 'cc_16_second_add.mp3',
        h: 'Try a second referral this quarter',
        sub: 'Companion Care allows one referral per member per calendar quarter. To see what happens when you try for a second one, select <b>Add Referral</b> again.',
        say: 'Now the quarter rule. A member can have only one companion care referral per calendar quarter. Click Add Referral again, to see what happens if you try for a second.',
        enter: function (H) { K.ensureFirstDone(H, Q2); S(H).expanded = null; H.TM.render(); },
        target: '[data-add-ref]', tag: 'Select Add Referral',
        done: function (H) { return H.route().name === 'add'; } },

      { id: 'second-cart', au: 'cc_17_second_cart.mp3',
        h: 'Add it to the cart',
        sub: 'We filled in the questions and a few hours for you. Select <b>Add to Cart</b>.',
        say: 'We\'ve filled in the questions and a few hours for you. Click Add to Cart.',
        enter: function (H) { K.startSecond(H, Q2); },
        target: '#addToCart', tag: 'Select Add to Cart',
        done: function (H) { return H.route().name === 'cart'; } },

      { id: 'second-checkout', au: 'cc_18_second_checkout.mp3',
        h: 'Try to check out',
        sub: 'Select <b>Checkout</b>, then <b>Confirm</b>.',
        say: 'Try to check out. Click Checkout, then Confirm.',
        enter: function (H) { var c = S(H).cart; if (!(H.route().name === 'cart' && c.length === 1 && c[0].qty === Q2)) K.secondInCart(H, Q2); },
        target: K.confirmTarget, tag: K.confirmTag,
        done: K.checkoutFailed },

      { id: 'second-read', au: 'cc_19_second_read.mp3', info: true,
        h: 'Read the message',
        sub: 'Checkout failed with an <b>Eligibility fail</b> message: <b>Companion Care allows one referral per member per calendar quarter.</b> It names the referral that is already open for Q1 2027. The new item stays in the cart, so you can remove it. A new referral can be created from April 1.',
        say: 'Checkout fails with an eligibility fail message. It says companion care allows one referral per member, per calendar quarter, and it names the referral that\'s already open for this quarter. The new item stays in your cart, so you can remove it. A new companion care referral can be created starting April first, when the next quarter begins.',
        enter: function (H) { var c = S(H).cart; if (!(H.route().name === 'cart' && c.length === 1 && c[0].qty === Q2)) K.secondInCart(H, Q2); if (!H.q('.toast.err')) { H.TM.doCheckout(); H.q('#confirmCo').click(); } },
        target: function (H, doc) { return doc.querySelector('.toast.err') || doc.querySelector('table'); }, tag: 'Checkout failed' }
    ],

    outro: {
      eyebrow: 'All set',
      title: 'You created a Companion Care referral.',
      sub: 'You searched for the member, answered the six facility questions and the SSBCI condition, chose the hours, and checked out. You also saw Benefits Hub stop a second Companion Care referral in the same quarter.',
      links: [{ href: '../resources/Adding a Referral - Job Aid.pdf', label: 'Job aid: Adding a Referral' },{ href: '../resources/Aetna Benefits at a Glance - Job Aid.pdf', label: 'Job aid: Aetna Benefits at a Glance' }],
      au: 'cc_20_outro.mp3',
      say: 'You\'ve created a companion care referral, answered all six facility questions and the S-S-B-C-I condition, and seen Benefits Hub stop a second referral in the same quarter. The Adding a Referral job aid and the benefits at a glance sheet are linked here. Next, managing a referral once it exists.'
    }
  };
})();
