/* Post Discharge: create the referral, in two examples that follow the SME mock's scenarios.
   Example 1: TEST-1002 had a discharge in January and used all 12 hours ("A second discharge in the same year").
   Example 2: TEST-1005 is readmitted while a referral is still open ("Readmission during an open window").
   Post Discharge - No Conditions follows the same steps (per the SME), so it is covered in the intro and outro, not a third example.
   `say` = narration script, `sub` = on-screen caption. */
(function () {
  var groups = [['bestNumber', 'pp1_name', 'pp1_rel', 'pp1_phi'], ['hospital', 'anticipatedDischarge', 'careNeeded'], ['conditions'], ['supportNeeds']];
  var A = GuideKit({ member: 'TEST-1002', program: 'PD12', qty: 12, groups: groups });
  var B = GuideKit({ member: 'TEST-1005', program: 'PD12', qty: 12, groups: groups });
  var S = A.S, TILE = 'In-Home Support Post-Discharge';

  function openPrompt(K) { return function (H) { if (!H.q('[data-tu]')) { K.ensureMember(H, true); H.TM.onAddReferral(H.member(K.MID), K.auth(H).id); } }; }
  function dialogOpen(H) { return !!H.q('[data-tu]'); }
  function closingNotice(H, doc) { return Array.prototype.slice.call(doc.querySelectorAll('.alert.info')).filter(function (e) { return /Submitting will close/.test(e.textContent); })[0] || null; }
  function failedChip(H, doc) { return Array.prototype.slice.call(doc.querySelectorAll('.chip')).filter(function (e) { return /Eligibility Failed/.test(e.textContent); })[0] || null; }

  window.GUIDE_CONFIG = {
    engine: '../engine/bh-mock.html',
    logo: '../assets/img/bee-icon.png',
    finishHref: '../Begin-Training.html',
    scenarios: ['A second discharge in the same year', 'Readmission during an open window'],

    cover: {
      badge: 'Benefits Hub',
      title: 'Create a Post-Discharge Referral',
      sub: 'Post-Discharge gives a member in-home help in the 30 days after a hospital or facility discharge. You will work through two examples: a member who already used an earlier referral, and a member who is readmitted while a referral is still open. Post Discharge - No Conditions follows the same steps.',
      meta: [['~20 minutes', 'self-paced'], ['12 hours', 'per discharge']],
      au: 'pd_00_cover.mp3',
      say: 'Post-discharge gives a member in-home help in the thirty days after leaving a hospital or facility. This module has two examples, because post-discharge has two situations you\'ll see all the time. First, a member who already used an earlier referral and now has a new discharge. Second, a member who goes back into the hospital while a referral is still open. By the end, you\'ll know exactly how Benefits Hub handles both. One more thing: post-discharge, no conditions, follows these same steps, so everything you learn here applies to both. All the members here are training members.'
    },

    steps: [
      /* ---------------- Example 1: a new discharge, earlier referral complete ---------------- */
      { id: 'search', au: 'pd_01_search.mp3',
        h: 'Example 1: find the member',
        sub: 'Type the training member number <b>TEST-1002</b> in the search box and press Enter.',
        say: 'Example one. Search for the member: test dash one zero zero two. Type it in and press Enter.',
        enter: function (H) { H.TM.reset(); H.TM.go({ name: 'home' }); },
        target: '#memberSearch', tag: 'Type TEST-1002',
        done: function (H) { var r = H.route(); return r.name === 'member' && r.id === A.MID; } },

      { id: 'tile', au: 'pd_02_tile.mp3',
        h: 'Open the Post-Discharge benefit',
        sub: 'This member has two benefits. Select the <b>In-Home Support Post-Discharge</b> tile.',
        say: 'This member has two benefits, personal care and post-discharge. Click the post-discharge tile.',
        enter: function (H) { A.ensureMember(H, false); },
        target: '.tile[title="' + TILE + '"]', tag: 'Select this benefit',
        done: function (H) { return S(H).tile[A.MID] === H.authId(A.MID, A.PROG); } },

      { id: 'auth', au: 'pd_03_auth.mp3',
        h: 'Check the hours, then add a referral',
        sub: 'This member had a discharge in January and used all 12 hours. <b>Remaining</b> is 0, and the earlier referral shows <b>Completed</b>. Select <b>Add Referral</b>.',
        say: 'Look at the numbers. This member had a discharge back in January and used all twelve hours, so remaining is zero, and that earlier referral shows Completed. Now the member has a new discharge and needs help again. Click Add Referral.',
        enter: function (H) { A.ensureMember(H, true); },
        target: '[data-add-ref]', tag: 'Select Add Referral', done: dialogOpen },

      { id: 'prompt', au: 'pd_04_prompt.mp3',
        h: 'Answer the new-discharge question',
        sub: 'Benefits Hub asks <b>"Does this member need a new post-discharge referral?"</b> It shows how many of the 12 hours are left. If the answer is yes, hours go back to 12, and leftover hours do not add on top. No hours are left, so the option to use remaining hours is hidden. Select <b>Yes, new discharge</b>.',
        say: 'Here\'s the question that makes post-discharge different. Because this member has fewer hours left than one discharge is worth, Benefits Hub asks whether they need a new post-discharge referral. It tells you how many of the twelve hours remain. If the answer is yes, the hours go back to twelve, and leftover hours don\'t stack on top. This member has none left, so the option to use remaining hours isn\'t even shown. This is a new discharge, so click yes.',
        enter: openPrompt(A),
        target: '[data-tu="yes"]', tag: 'Select Yes',
        done: function (H) { return H.route().name === 'add'; } },

      { id: 'address', au: 'pd_04b_address.mp3', info: true,
        h: 'Where will care take place?',
        sub: 'Before you choose the service, check <b>where care will take place</b>. If it is somewhere other than the member\'s home, select <b>(change service address)</b> and enter that address. Services refresh for the new location. <b>After checkout the address cannot be edited.</b>',
        say: 'Before you pick the service, check where care will take place. If it\'s the member\'s home, you\'re all set. If it\'s somewhere else, click change service address and enter that address now. The services shown depend on that location, and once you check out, the address can\'t be edited. So this is the moment to set it.',
        enter: function (H) { A.ensureAdd(H, false); },
        target: '[data-addr]', tag: 'Change service address' },

      { id: 'service', au: 'pd_05_service.mp3',
        h: 'Choose the service',
        sub: 'Select the <b>Search For Services</b> field, then choose <b>In-Home Support - Post-Discharge</b>.',
        say: 'Now choose the service. Click the search box, and select in-home support, post-discharge.',
        enter: function (H) { A.ensureAdd(H, false); },
        target: A.svcTarget, tag: A.svcTag('Post-Discharge'),
        done: function (H) { return !!(H.form() && H.form().svc); } },

      { id: 'contact', au: 'pd_06_contact.mp3',
        h: 'Who should THB work with?',
        sub: 'Under <b>Service Questions</b>, enter the <b>best number to reach the member</b> and <b>point person 1</b>: name, relationship to the member, and whether PHI can be shared with them. Optional fields can be left blank, and you can add point persons 2 and 3 if the member has them.',
        say: 'The questions start with who the Helper Bees should work with. Enter the best number to reach the member, and a mobile is best. Then complete point person one: name, relationship, and whether health information can be shared with them. That last answer tells the Helper Bees who they\'re allowed to talk to about the member\'s care. The other point person details are optional, and you can add more contacts if the member has them.',
        enter: function (H) { A.ensureForm(H, -1); },
        target: function (H) { return A.missing(H, ['bestNumber', 'pp1_name', 'pp1_rel', 'pp1_phi']); }, tag: 'Answer this question',
        done: function (H) { return A.answered(H, ['bestNumber', 'pp1_name', 'pp1_rel', 'pp1_phi']); } },

      { id: 'dates', au: 'pd_07_dates.mp3',
        h: 'Where is the member, and when is care needed?',
        sub: 'Enter the <b>current hospital or facility</b> and the <b>anticipated discharge date</b> if you know them. The anticipated date is for planning only. Then enter the <b>date care is needed</b>. It can differ from the discharge date, and THB schedules the first visit for it.',
        say: 'Next, the timing. Enter the hospital and the anticipated discharge date if you know them. Those are for planning, and discharge dates change, so treat them as best guesses. The required one is the date care is needed, which can be different from the discharge date. That\'s the date the Helper Bees schedule the first visit for, so choose the day the member will really need help.',
        enter: function (H) { A.ensureForm(H, 0); },
        target: '#q-careNeeded', tag: 'Required date',
        done: function (H) { return A.answered(H, ['careNeeded']); } },

      { id: 'conditions', au: 'pd_08_conditions.mp3',
        h: 'Qualifying chronic conditions',
        sub: 'Open the <b>qualifying chronic conditions</b> list and select all that apply. This question is required, so choose at least one.',
        say: 'Now the qualifying chronic conditions. Open the list and select everything that applies to this member. This one is required, so choose at least one. These answers help give the provider a picture of the member\'s situation.',
        enter: function (H) { A.ensureForm(H, 1); A.clear(H, ['conditions']); },
        target: '#q-conditions', tag: 'Open and choose',
        done: function (H) { return A.answered(H, ['conditions']); } },

      { id: 'support', au: 'pd_09_support.mp3',
        h: 'Support needs',
        sub: 'Open <b>Support needs</b> and select at least one. The list covers ADLs (daily living) and IADLs (household tasks). <b>Care interest confirmed with member?</b> is optional.',
        say: 'Then support needs. Choose at least one from the list, which covers personal tasks like bathing and dressing, and household help like meals and laundry. Pick what this member will actually need. The care interest question is optional.',
        enter: function (H) { A.ensureForm(H, 2); A.clear(H, ['supportNeeds']); },
        target: '#q-supportNeeds', tag: 'Open and choose',
        done: function (H) { return A.answered(H, ['supportNeeds']); } },

      { id: 'narrative', au: 'pd_10_narrative.mp3', info: true,
        h: 'Add a referral narrative (optional)',
        sub: 'You can write a <b>referral narrative</b> of up to 250 characters. Because Post-Discharge has service questions, Benefits Hub adds a first line telling providers to review them. That line counts toward the 250, so the counter stops lower. You can edit the narrative after the referral is created.',
        say: 'The referral narrative is optional, up to two hundred fifty characters. Use it for anything the questions don\'t capture. Because post-discharge has service questions, Benefits Hub starts it with a line telling providers to review them, and that line uses part of your characters. You can always edit the narrative later.',
        enter: function (H) { A.ensureForm(H, 3); },
        target: '#narrAdd', tag: 'Optional' },

      { id: 'hours', au: 'pd_11_hours.mp3', info: true,
        h: 'Check the order details',
        sub: 'Under <b>Order Details</b>, <b>Quantity</b> is <b>1</b> and <b>Total Points</b> is <b>12</b>. Every Aetna referral is one item that costs the full allotment, here all 12 hours for this discharge, so there is nothing to type. Read the note below: the referral expires 30 days after submission, and day one is tomorrow.',
        say: 'Look at Order Details. The quantity is one, and total points is twelve. Every Aetna referral works this way: one item that costs the member\'s full allotment, which here is all twelve hours for this discharge. So there\'s nothing to type. Read the note under the order details too: this referral expires thirty days after you submit it, and day one is tomorrow.',
        enter: function (H) { A.ensureForm(H, 3); },
        target: function (H, doc) { return doc.querySelector('.order'); }, tag: '1 item, 12 points' },

      { id: 'cart', au: 'pd_12_cart.mp3',
        h: 'Add it to the cart',
        sub: 'When every required question is answered, <b>Add to Cart</b> turns on. Select it.',
        say: 'Everything required is answered, so Add to Cart is active. Click it.',
        enter: function (H) { A.ensureForm(H, A.GROUPS.length); },
        target: '#addToCart', tag: 'Select Add to Cart',
        done: function (H) { return H.route().name === 'cart'; } },

      { id: 'review', au: 'pd_13_review.mp3', info: true,
        h: 'Review the Referrals Summary',
        sub: 'Check the quantity and the <b>Service Address</b>. This is where the referral will route. <b>You can\'t edit the address here.</b> If it is wrong, remove the item with the trash icon, go back, and change the address on the Add Referral screen before you check out. After checkout it cannot be edited. The eye icon lets you review the question answers.',
        say: 'This is the Referrals Summary, your last check before submitting. Look at the quantity, and then at the service address, because that\'s where the referral will route. You can\'t edit the address on this screen. If it\'s wrong, remove the item with the trash icon, go back, and change it on the Add Referral screen before you check out. After checkout, it can\'t be edited at all. The eye icon lets you review the answers you gave.',
        enter: function (H) { A.ensureCart(H); },
        target: A.addressCard, tag: 'Verify the address' },

      { id: 'checkout', au: 'pd_14_checkout.mp3',
        h: 'Check out and confirm',
        sub: 'Select <b>Checkout</b>. Benefits Hub asks you to confirm. THB will contact the member or their point person to confirm interest before any provider outreach. Select <b>Confirm</b>.',
        say: 'Click Checkout, then Confirm. Once you confirm, the Helper Bees reach out to the member or their point person to confirm interest, before any provider is contacted. Provider scheduling comes after a provider accepts.',
        enter: function (H) { A.ensureCart(H); },
        target: A.confirmTarget, tag: A.confirmTag, done: A.submittedDone },

      { id: 'after', au: 'pd_15_after.mp3', info: true,
        h: 'See the new referral',
        sub: 'There are now two post-discharge referrals. The January one is still <b>Completed</b>, and the new one is <b>New</b>, expiring 30 days after submission. Post-discharge referrals have no discharge date to record.',
        say: 'Your new referral is on the member page with the status New. The January referral is still there, marked Completed, so the member\'s history stays intact. Look at the expiration: thirty days after submission. And unlike Recovery at Home, post-discharge referrals don\'t have a discharge date for you to record, so there\'s nothing more to enter.',
        enter: function (H) { A.expandNew(H); },
        target: A.newRefTarget, tag: 'Your new referral' },

      /* ---------------- Example 2: readmission while a referral is open ---------------- */
      { id: 'search2', au: 'pd_16_search2.mp3',
        h: 'Example 2: a readmission',
        sub: 'Now a member who started post-discharge services and has been <b>readmitted</b> to the hospital while the referral is still open. Search for <b>TEST-1005</b>.',
        say: 'Example two. This member started post-discharge services after a discharge, and now they\'ve gone back into the hospital. Search for them: test dash one zero zero five.',
        enter: function (H) { H.TM.reset(); H.TM.go({ name: 'home' }); },
        target: '#memberSearch', tag: 'Type TEST-1005',
        done: function (H) { var r = H.route(); return r.name === 'member' && r.id === B.MID; } },

      { id: 'tile2', au: 'pd_17_tile2.mp3',
        h: 'Open the Post-Discharge benefit',
        sub: 'Select the <b>In-Home Support Post-Discharge</b> tile.',
        say: 'Click the post-discharge tile.',
        enter: function (H) { B.ensureMember(H, false); },
        target: '.tile[title="' + TILE + '"]', tag: 'Select this benefit',
        done: function (H) { return S(H).tile[B.MID] === H.authId(B.MID, B.PROG); } },

      { id: 'open-ref', au: 'pd_18_openref.mp3', info: true,
        h: 'Look at the open referral',
        sub: 'The earlier referral is still open: <b>Accepted By Provider</b>, with 5 of 12 hours used. The 7 unused hours are counted as <b>Pending</b>, so <b>Remaining</b> is 0.',
        say: 'Look at what\'s here before you do anything. The earlier referral is still open. It shows Accepted by Provider, and five of its twelve hours have been used. The seven unused hours count as pending, which is why remaining is zero. This is the situation that trips people up: there\'s an open referral, and the member needs a new one for their next discharge.',
        enter: function (H) { B.ensureMember(H, true); },
        target: 'tr[data-expand] .chip', tag: 'The open referral' },

      { id: 'addref2', au: 'pd_19_addref2.mp3',
        h: 'Add a referral for the new discharge',
        sub: 'The member needs help again after the next discharge. Select <b>Add Referral</b>.',
        say: 'The member will need help again after this next discharge. Click Add Referral.',
        enter: function (H) { B.ensureMember(H, true); },
        target: '[data-add-ref]', tag: 'Select Add Referral', done: dialogOpen },

      { id: 'prompt2', au: 'pd_20_prompt2.mp3',
        h: 'Answer the new-discharge question',
        sub: 'The same question appears. <b>Remaining</b> is 0 here too, so the option to use remaining hours is hidden. A readmission means a new discharge, so select <b>Yes, new discharge</b>. Hours go back to 12.',
        say: 'The same question appears, and the same answer applies. Remaining is zero, so there\'s no option to use leftover hours. A readmission means a new discharge is coming, so click yes, new discharge. The hours go back to twelve.',
        enter: openPrompt(B),
        target: '[data-tu="yes"]', tag: 'Select Yes',
        done: function (H) { return H.route().name === 'add'; } },

      { id: 'hours2', au: 'pd_21_hours2.mp3', info: true,
        h: 'Check the order details',
        sub: 'You just practiced the service questions, so this time they are <b>filled in for you</b>. For a real readmission you would answer them for the new discharge. <b>Total Points</b> is <b>12</b> again: the hours went back to 12 for this new discharge.',
        say: 'You just practiced the service questions, so this time we\'ve filled them in for you. In real life, you\'d answer them for this new discharge. Look at the order details: one item, twelve points. The hours went back to twelve for this new discharge, and this referral uses all of them.',
        enter: function (H) { B.ensureForm(H, 3); },
        target: function (H, doc) { return doc.querySelector('.order'); }, tag: '1 item, 12 points' },

      { id: 'cart2', au: 'pd_22_cart2.mp3',
        h: 'Add it to the cart',
        sub: 'Select <b>Add to Cart</b>.',
        say: 'Click Add to Cart.',
        enter: function (H) { B.ensureForm(H, B.GROUPS.length); },
        target: '#addToCart', tag: 'Select Add to Cart',
        done: function (H) { return H.route().name === 'cart'; } },

      { id: 'closing', au: 'pd_23_closing.mp3', info: true,
        h: 'Read the notice in the cart',
        sub: 'The cart warns you: <b>Submitting will close the open referral as Eligibility Failed. Its unused hours expire.</b> You do not close the old referral yourself. Benefits Hub does it when you submit.',
        say: 'Pay attention to this notice in the cart, because it\'s the new behavior. Because this member has an open post-discharge referral, submitting the new one closes the old one, marked Eligibility Failed. The old referral\'s unused hours expire. They don\'t go back to the member. And notice what you don\'t have to do: you never close the old referral yourself. Benefits Hub does it for you when you submit.',
        enter: function (H) { B.ensureCart(H); },
        target: closingNotice, tag: 'Read this notice' },

      { id: 'checkout2', au: 'pd_24_checkout2.mp3',
        h: 'Check out and confirm',
        sub: 'Select <b>Checkout</b>, then <b>Confirm</b>.',
        say: 'Now click Checkout, and then Confirm.',
        enter: function (H) { B.ensureCart(H); },
        target: B.confirmTarget, tag: B.confirmTag, done: B.submittedDone },

      { id: 'after2', au: 'pd_25_after2.mp3', info: true,
        h: 'See what changed',
        sub: 'The earlier referral now shows <b>Eligibility Failed</b>, and the new referral is <b>New</b>. The 7 unused hours expired and did not go back to the member. You did not have to close anything.',
        say: 'Here\'s the result. The earlier referral now shows Eligibility Failed, and the new referral is New. Benefits Hub closed the old one for you, and its seven unused hours expired. If a family asks where those hours went, that\'s the answer: they don\'t carry over, and the new referral starts fresh with twelve.',
        enter: function (H) { B.ensureSubmitted(H); H.selectTile(B.MID, B.PROG); S(H).expanded = null; H.TM.render(); },
        target: failedChip, tag: 'Closed automatically' }
    ],

    outro: {
      eyebrow: 'All set',
      title: 'You created Post-Discharge referrals.',
      sub: 'You created a referral for a new discharge after an earlier referral was used up, and you handled a readmission while a referral was still open. Post Discharge - No Conditions follows these same steps.',
      links: [{ href: '../resources/Adding a Referral - Job Aid.pdf', label: 'Job aid: Adding a Referral' },{ href: '../resources/Aetna Benefits at a Glance - Job Aid.pdf', label: 'Job aid: Aetna Benefits at a Glance' }],
      au: 'pd_26_outro.mp3',
      say: 'You\'ve handled both post-discharge situations. For a new discharge, you answer yes to the prompt, and the hours reset to twelve. For a readmission, you submit the new referral and Benefits Hub closes the old one. Post-discharge, no conditions, works the same way. The Adding a Referral job aid and the benefits at a glance sheet are linked here. Next up, personal care.'
    }
  };
})();
