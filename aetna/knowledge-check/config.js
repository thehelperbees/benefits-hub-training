/* Aetna Knowledge Check: name, four scenarios on the live Benefits Hub screens (Recovery at Home, Post Discharge,
   Personal Care, Companion Care), a 10-question quiz (70% to pass), results, and a printable certificate.
   Tasks are "blind": no pointer until the learner asks for a hint. Forms are partly filled in so the test is about decisions, not typing.
   `say` = narration script. */
(function () {
  var contact = ['bestNumber', 'pp1_name', 'pp1_rel', 'pp1_phi'], dates = ['hospital', 'anticipatedDischarge', 'careNeeded'];
  var R = GuideKit({ member: 'TEST-1001', program: 'RAH60', qty: 60, groups: [contact, dates, ['dx'], ['supportNeeds']] });
  var B = GuideKit({ member: 'TEST-1005', program: 'PD12', qty: 12, groups: [contact, dates, ['conditions'], ['supportNeeds']] });
  var P = GuideKit({ member: 'TEST-1002', program: 'IHSPC40', qty: 20, groups: [contact, ['adlNeeds']] });
  var C = GuideKit({ member: 'TEST-1006', program: 'CC40', qty: 8, groups: [['facility', 'facilityContact'], ['facilityPhone'], ['prefDates', 'prefTimes'], ['facilityRules'], ['ssbci']] });
  var S = R.S;

  function rahRef(H) { return H.member(R.MID).referrals.filter(function (r) { return r.program === 'RAH60'; })[0]; }
  function has(a, v) { return !!a && a.indexOf(v) >= 0; }

  /* pointer used only if the learner asks for a hint: home -> member -> tile -> Add Referral -> prompt -> service */
  function startTarget(K, tileTitle) {
    return function (H, doc) {
      var r = H.route();
      if (doc.querySelector('[data-tu="yes"]')) return doc.querySelector('[data-tu="yes"]');
      if (r.name === 'home') return doc.querySelector('#memberSearch');
      if (r.name === 'member') return S(H).tile[K.MID] !== H.authId(K.MID, K.PROG) ? doc.querySelector('.tile[title="' + tileTitle + '"]') : doc.querySelector('[data-add-ref]');
      if (r.name === 'add') return K.svcTarget(H);
      return null; };
  }
  function startTag(K) {
    return function (H) {
      var r = H.route();
      if (H.q('[data-tu="yes"]')) return 'Select Yes';
      if (r.name === 'home') return 'Type ' + K.MID;
      if (r.name === 'member') return S(H).tile[K.MID] !== H.authId(K.MID, K.PROG) ? 'Select this benefit' : 'Select Add Referral';
      return H.form() && H.form().svcOpen ? 'Select the service' : 'Select to search'; };
  }
  /* pointer for the "change service address" task */
  function addrTarget(K) {
    return function (H, doc) {
      if (doc.querySelector('#saveAddr')) {
        var m = H.member(K.MID), a1 = doc.querySelector('#a1'), a3 = doc.querySelector('#a3'), a4 = doc.querySelector('#a4'), a5 = doc.querySelector('#a5');
        if (a1.value === m.addr) return a1; if (a3.value === m.city) return a3; if (a4.value === m.state) return a4; if (a5.value === m.zip) return a5; return doc.querySelector('#saveAddr'); }
      return doc.querySelector('[data-addr]'); };
  }
  /* pointer for "fill the rest, set hours, add to cart, check out" */
  function finishTarget(H, doc) {
    var r = H.route(), f = H.form();
    if (r.name === 'cart') return doc.querySelector('#confirmCo') || doc.querySelector('#checkout');
    if (r.name === 'add' && f && f.qty >= 1) return doc.querySelector('#addToCart');
    return doc.querySelector('#qty'); }
  function finishTag(H) { var r = H.route(), f = H.form(); if (r.name === 'cart') return H.q('#confirmCo') ? 'Select Confirm' : 'Select Checkout'; if (r.name === 'add' && f && f.qty >= 1) return 'Select Add to Cart'; return 'Enter the hours'; }

  /* the Recovery at Home referral, created for the learner and backdated so a discharge date can be entered after it */
  function ensureRah(H) {
    H.TM.closeDialog(); H.qa('.menu').forEach(function (m) { m.remove(); });
    if (!rahRef(H)) R.submit(H);
    var r = rahRef(H); r.received = '2027-03-02'; r.expires = '2027-04-01'; if (r.discharge) { r.discharge = ''; }
    if (!(S(H).route.name === 'member' && S(H).route.id === R.MID)) H.openMember(R.MID);
    delete S(H).tile[R.MID]; S(H).expanded = null; H.TM.render(); }
  function dischargeTarget(H, doc) {
    if (doc.querySelector('#dDate')) return doc.querySelector('#dDate').value ? doc.querySelector('#saveD') : doc.querySelector('#dDate');
    if (doc.querySelector('.menu [data-act="discharge"]')) return doc.querySelector('.menu [data-act="discharge"]');
    if (S(H).tile[R.MID] !== H.authId(R.MID, 'RAH60')) return doc.querySelector('.tile[title="Recovery at Home"]');
    if (S(H).expanded !== rahRef(H).id) return doc.querySelector('[data-expand]');
    return doc.querySelector('.actbtn.add'); }
  function dischargeTag(H) {
    if (H.q('#dDate')) return H.q('#dDate').value ? 'Select Save' : 'Enter 3/8/2027';
    if (H.q('.menu')) return 'Select Discharge date';
    if (S(H).tile[R.MID] !== H.authId(R.MID, 'RAH60')) return 'Select this benefit';
    if (S(H).expanded !== rahRef(H).id) return 'Expand the referral';
    return 'Select Add'; }

  var Q = [
    { eyebrow: 'Recovery at Home', q: 'You submit a Recovery at Home referral for a member who has an open Personal Care referral. What happens to the Personal Care referral?',
      opts: ['It is closed as Eligibility Failed.', 'It goes On Hold, and resumes when Recovery at Home ends.', 'It keeps running alongside Recovery at Home.', 'Its unused hours move to the Recovery at Home referral.'], ok: 1,
      explain: 'Recovery at Home hours apply first. The Personal Care referral goes on hold automatically and resumes when Recovery at Home ends. You do not need to do anything.',
      say: 'Question one. You submit a Recovery at Home referral for a member who has an open personal care referral. What happens to the personal care referral?' },
    { eyebrow: 'Recovery at Home', q: 'A Recovery at Home referral was submitted on March 2, and no discharge date has been recorded. When does it expire?',
      opts: ['30 days after submission, on April 1.', '30 days after the anticipated discharge date.', 'At the end of the quarter, on March 31.', 'On December 31.'], ok: 0,
      explain: 'Until a discharge date is recorded, a Recovery at Home referral expires 30 days after submission, and never later than 12/31. When the discharge date is recorded, it moves to 30 days after discharge.',
      say: 'Question two. A Recovery at Home referral was submitted on March 2, and no discharge date has been recorded. When does it expire?' },
    { eyebrow: 'Recovery at Home', q: 'Where do you record a discharge date, and on which referrals does that option appear?',
      opts: ['Under View, on every referral.', 'In the member\'s Overview, on every referral.', 'Under Add > Discharge date, on Recovery at Home referrals only.', 'Under Add > Discharge date, on Post-Discharge referrals only.'], ok: 2,
      explain: 'Discharge date is under the Add menu and appears on Recovery at Home referrals only. It stays in the menu so the date can be corrected later. Benefits Hub blocks a date that would make the referral already expired.',
      say: 'Question three. Where do you record a discharge date, and on which referrals does that option appear?' },
    { eyebrow: 'Post-Discharge', q: 'A member has used all 12 post-discharge hours and has a new discharge. Benefits Hub asks, "Does this member need a new post-discharge referral?" What do you answer?',
      opts: ['Close the old referral first, then answer.', 'Yes, new discharge. Hours go back to 12, and leftover hours do not add on top.', 'No, use remaining hours.', 'Neither. Submit a Zendesk ticket.'], ok: 1,
      explain: 'Answer Yes, new discharge. The hours go back to 12 for the new discharge. When no hours are left, the option to use remaining hours is hidden.',
      say: 'Question four. A member has used all 12 post-discharge hours and has a new discharge. Benefits Hub asks whether this member needs a new post-discharge referral. What do you answer?' },
    { eyebrow: 'Post-Discharge', q: 'A member is readmitted while a post-discharge referral is still open. You submit the new referral. What happens to the old one?',
      opts: ['It stays open next to the new one.', 'You must close it yourself before you submit.', 'It is marked Completed, and the unused hours return to the member.', 'Benefits Hub closes it as Eligibility Failed. Its unused hours expire.'], ok: 3,
      explain: 'You do not close the old referral. The cart warns you, and when you submit, Benefits Hub closes it as Eligibility Failed. Its unused hours expire and do not go back to the member.',
      say: 'Question five. A member is readmitted while a post-discharge referral is still open. You submit the new referral. What happens to the old one?' },
    { eyebrow: 'Personal Care', q: 'How many activities of daily living (ADLs) must be selected on a Personal Care referral?',
      opts: ['At least two. Benefits Hub will not let you continue with fewer.', 'At least one.', 'All six.', 'None. ADLs are optional.'], ok: 0,
      explain: 'Personal Care requires help with at least two ADLs. The list of instrumental ADLs is optional.',
      say: 'Question six. How many activities of daily living must be selected on a personal care referral?' },
    { eyebrow: 'Companion Care', q: 'Which statement about Companion Care is true?',
      opts: ['A member can have one referral per month, and the facility questions are optional.', 'The facility questions are required, but the SSBCI condition is optional.', 'A member can have several referrals in a quarter if the hours add up to 40 or fewer.', 'A member can have one referral per calendar quarter. Every facility question is required, and at least one SSBCI chronic condition must be chosen.'], ok: 3,
      explain: 'Companion Care allows one referral per member per calendar quarter, and a second one fails at checkout. All six facility questions are required open text, and at least one SSBCI condition must be chosen.',
      say: 'Question seven. Which statement about companion care is true?' },
    { eyebrow: 'Service address', q: 'Care will take place at a relative\'s home, not the address on file. When and how do you set that address?',
      opts: ['After checkout, by editing the referral.', 'By updating the address in the member\'s Overview.', 'On Add Referral, select (change service address) and enter it before you add to cart.', 'In the referral narrative.'], ok: 2,
      explain: 'Use (change service address) on the Add Referral page, before you add to cart. You cannot edit the address on the checkout screen, and the member\'s address on file does not change. After checkout the address cannot be edited, and any change then takes a Zendesk ticket.',
      say: 'Question eight. Care will take place at a relative\'s home, not the address on file. When and how do you set that address?' },
    { eyebrow: 'Notes', q: 'You add a note to a referral because a provider has not responded. What happens?',
      opts: ['The provider is notified.', 'The note is recorded on the referral, but it does not alert The Helper Bees. If something needs action, submit a Zendesk ticket.', 'The Helper Bees are alerted right away.', 'The referral is escalated automatically.'], ok: 1,
      explain: 'Notes record information within the referral. Adding a note does not alert The Helper Bees. If something needs action, submit a Zendesk ticket.',
      say: 'Question nine. You add a note to a referral because a provider has not responded. What happens?' },
    { eyebrow: 'Referral narrative', q: 'Which statement about the referral narrative is true?',
      opts: ['Case managers can write it on Add Referral and edit it later, up to 250 characters.', 'Only The Helper Bees staff can write it.', 'It can only be edited before the referral is checked out.', 'It has no character limit.'], ok: 0,
      explain: 'Case managers can write the narrative on Add Referral and edit it later with the pencil on the referral, up to 250 characters. When the service has questions, Benefits Hub adds a first line pointing providers to them.',
      say: 'Question ten. Which statement about the referral narrative is true?' }
  ];
  var quizScreens = Q.map(function (q, n) {
    return { t: 'quiz', eyebrow: q.eyebrow, q: q.q, opts: q.opts.map(function (o, k) { return { label: o, correct: k === q.ok }; }), explain: q.explain };   // questions read on screen (no narration clip per question)
  });

  window.GUIDE_CONFIG = {
    engine: '../engine/bh-mock.html',
    logo: '../assets/img/bee-icon.png',
    finishHref: '../Begin-Training.html',
    scenarios: [],
    certificate: {
      org: 'The Helper Bees &middot; Aetna Partner Training',
      desc: 'has successfully completed the Aetna Benefits Hub training, including all training modules and the final knowledge check.',
      congrats: 'You\'ve completed the Aetna Benefits Hub training. Save or print your certificate below. When you need a refresher later, the Resource Library has quick-reference job aids and FAQ for day-to-day questions.',
      libraryHref: '../library.html'
    },
    cover: {
      badge: 'Benefits Hub', title: 'Knowledge Check',
      sub: 'Put what you learned to work. You will handle four scenarios on the real Benefits Hub screens, one for each Aetna benefit, then answer a short quiz and earn your certificate of completion.',
      meta: [['~25 minutes', 'self-paced'], ['70% to pass', 'unlimited attempts']],
      au: 'kc_00_cover.mp3',
      say: 'This is the knowledge check, your chance to put everything together. You\'ll handle four realistic scenarios in Benefits Hub, one for each Aetna benefit, then take a short quiz, and earn your certificate. Think of it like your first week on the job: a member needs something, and you decide what to do. You\'ll use training members, so nothing here is real.'
    },

    screens: [
      { t: 'cover' },
      { t: 'name', au: 'kc_01_name.mp3', say: 'Before we start, enter your name. It goes on your certificate of completion, and it stays in your browser for this session, so it isn\'t sent anywhere.' },
      { t: 'intro', eyebrow: 'Put it all together', h: 'Four scenarios, then a quiz',
        sub: 'In each scenario you will do the task in Benefits Hub yourself. The screens stay in front of you, and the pointer stays off. If you get stuck, select <b>Need a hint</b>. The forms are partly filled in, so the test is about the decisions, not the typing.',
        cards: [
          { n: 1, b: 'Recovery at Home', s: 'Refer a member who is in the hospital, then record the discharge date.' },
          { n: 2, b: 'Post-Discharge', s: 'Handle a readmission while a referral is open.' },
          { n: 3, b: 'Personal Care', s: 'Set up care at a different address, with the right support needs.' },
          { n: 4, b: 'Companion Care', s: 'Answer the facility questions for a member who lives in a partner facility.' }],
        au: 'kc_02_intro.mp3',
        say: 'Here\'s how this works. You\'ll handle four scenarios, one for each benefit. In each one, you do the task in Benefits Hub yourself, and the pointer stays off, so it\'s up to you to decide where to click. If you get stuck, select Need a hint, and the pointer will appear. Using a hint doesn\'t affect your result. The forms are partly filled in for you, so the point isn\'t typing. It\'s the decisions: which benefit, which choices, and what to watch for.' },

      /* ---------- Scenario 1: Recovery at Home ---------- */
      { id: 's1-start', blind: true, label: 'Scenario 1 of 4 · Task 1 of 4', kicker: 'Scenario 1 · Recovery at Home', au: 'kc_03_s1_start.mp3',
        h: 'Start the referral',
        sub: '<b>TEST-1001</b> was just admitted to the hospital with pneumonia and will need help at home afterward. Find the member and start a referral for the benefit that fits. Stop when you reach the Add Referral page.',
        say: 'Scenario one. A member has just been admitted to the hospital with pneumonia, and the care team expects they\'ll need help at home afterward. Find the member, then start a referral for the benefit that fits. Stop when you reach the Add Referral page.',
        enter: function (H) { H.TM.reset(); H.TM.go({ name: 'home' }); },
        target: startTarget(R, 'Recovery at Home'), tag: startTag(R),
        done: function (H) { var r = H.route(); return r.name === 'add' && r.id === R.MID && r.auth === H.authId(R.MID, 'RAH60'); } },

      { id: 's1-service', blind: true, label: 'Scenario 1 of 4 · Task 2 of 4', kicker: 'Scenario 1 · Recovery at Home', au: 'kc_04_s1_service.mp3',
        h: 'Choose the service and the diagnosis',
        sub: 'Choose the service, then the qualifying diagnosis: <b>pneumonia</b>. The other questions are filled in for you.',
        say: 'Choose the service, and then choose the qualifying diagnosis, which here is pneumonia. We\'ve filled in the other questions for you, so you can focus on those two.',
        enter: function (H) { R.ensureAdd(H, false); R.fill(H, 3); delete S(H).form.answers.dx; H.TM.render(); },
        target: function (H, doc) { return !(H.form() && H.form().svc) ? R.svcTarget(H) : doc.querySelector('#q-dx'); },
        tag: function (H) { return !(H.form() && H.form().svc) ? R.svcTag('Recovery at Home')(H) : 'Choose the diagnosis'; },
        done: function (H) { var f = H.form(); return !!(f && f.svc && /^Pneumonia/.test(f.answers.dx || '')); } },

      { id: 's1-submit', blind: true, label: 'Scenario 1 of 4 · Task 3 of 4', kicker: 'Scenario 1 · Recovery at Home', au: 'kc_05_s1_submit.mp3',
        h: 'Set the hours and submit',
        sub: 'Enter the full <b>60</b> hours, add to cart, check out, and confirm.',
        say: 'Set the hours to the full allowance, which is sixty. Then add the referral to the cart, check out, and confirm.',
        enter: function (H) { R.ensureForm(H, 3); delete S(H).form.qty; H.TM.render(); },
        target: finishTarget, tag: finishTag,
        done: function (H) { var r = R.newRef(H); return R.submittedDone(H) && !!r && r.hours === 60; } },

      { id: 's1-discharge', blind: true, label: 'Scenario 1 of 4 · Task 4 of 4', kicker: 'Scenario 1 · Recovery at Home', au: 'kc_06_s1_discharge.mp3',
        h: 'Record the discharge date',
        sub: 'A few days later, the member goes home on <b>3/8/2027</b>. Record the discharge date on the referral.',
        say: 'A few days later, the member goes home. They were discharged on March eighth. Record that on the referral. Think about where that option lives, and which benefit it applies to.',
        enter: function (H) { ensureRah(H); },
        target: dischargeTarget, tag: dischargeTag,
        done: function (H) { return rahRef(H).discharge === '2027-03-08'; } },

      /* ---------- Scenario 2: Post Discharge readmission ---------- */
      { id: 's2-start', blind: true, label: 'Scenario 2 of 4 · Task 1 of 2', kicker: 'Scenario 2 · Post-Discharge', au: 'kc_07_s2_start.mp3',
        h: 'Start the new referral',
        sub: '<b>TEST-1005</b> has an open post-discharge referral and was just <b>readmitted</b> to the hospital. They will need help again after this discharge. Open the member and start a new referral for the benefit that fits. Answer any prompt that appears. Stop when you reach the Add Referral page.',
        say: 'Scenario two. This member has an open post-discharge referral, and was just readmitted to the hospital. They\'ll need help again after this discharge. Open the member, and start a new referral for the benefit that fits. If a question appears along the way, answer it based on what you\'ve learned. Stop when you reach the Add Referral page.',
        enter: function (H) { H.TM.reset(); H.TM.go({ name: 'home' }); },
        target: startTarget(B, 'In-Home Support Post-Discharge'), tag: startTag(B),
        done: function (H) { var r = H.route(); return r.name === 'add' && r.id === B.MID && r.auth === H.authId(B.MID, 'PD12') && (B.auth(H).topUps || 0) >= 1; } },

      { id: 's2-submit', blind: true, label: 'Scenario 2 of 4 · Task 2 of 2', kicker: 'Scenario 2 · Post-Discharge', au: 'kc_08_s2_submit.mp3',
        h: 'Submit the new referral',
        sub: 'The questions are filled in for you. Enter <b>12</b> hours, add to cart, and read the cart notice. Then check out and confirm.',
        say: 'The questions are filled in, so go straight to the hours. Enter twelve, then add the referral to the cart. Read the cart carefully before you check out, because there\'s something in there worth noticing. Then check out and confirm.',
        enter: function (H) { B.ensureForm(H, 3); delete S(H).form.qty; H.TM.render(); },
        target: finishTarget, tag: finishTag,
        done: B.submittedDone },

      /* ---------- Scenario 3: Personal Care, different address ---------- */
      { id: 's3-start', blind: true, label: 'Scenario 3 of 4 · Task 1 of 3', kicker: 'Scenario 3 · Personal Care', au: 'kc_09_s3_start.mp3',
        h: 'Start the referral',
        sub: '<b>TEST-1002</b> needs help with <b>bathing</b> and <b>dressing</b>. Find the member and start a referral for the benefit that fits. Stop when you reach the Add Referral page.',
        say: 'Scenario three. This member needs help with bathing and dressing. Find the member, and start a referral for the benefit that fits. Stop when you reach the Add Referral page.',
        enter: function (H) { H.TM.reset(); H.TM.go({ name: 'home' }); },
        target: startTarget(P, 'In-Home Support Personal Care'), tag: startTag(P),
        done: function (H) { var r = H.route(); return r.name === 'add' && r.id === P.MID && r.auth === H.authId(P.MID, 'IHSPC40'); } },

      { id: 's3-address', blind: true, label: 'Scenario 3 of 4 · Task 2 of 3', kicker: 'Scenario 3 · Personal Care', au: 'kc_10_s3_address.mp3',
        h: 'Set where care will take place',
        sub: 'For the next few weeks she is staying at her daughter\'s home: <b>12 Sample Road, Faketon, FL 33101</b>. Make sure care is set up at that address.',
        say: 'Here\'s a detail from the call: for the next few weeks, she\'s staying at her daughter\'s home, at twelve Sample Road, Faketon, Florida, three three one zero one. Make sure care is set up at that address.',
        enter: function (H) { P.ensureAdd(H, false); },
        target: addrTarget(P), tag: function (H) { return H.q('#saveAddr') ? 'Enter the new address' : 'Select to change'; },
        done: function (H) { var f = H.form(); return !!(f && /12 sample road/i.test(f.addr || '') && f.zip === '33101'); } },

      { id: 's3-submit', blind: true, label: 'Scenario 3 of 4 · Task 3 of 3', kicker: 'Scenario 3 · Personal Care', au: 'kc_11_s3_submit.mp3',
        h: 'Answer the support needs and submit',
        sub: 'The contact questions are filled in. Choose the service, then select the activities of daily living she needs help with. Then enter <b>20</b> hours, add to cart, check out, and confirm.',
        say: 'Now choose the service, and select the activities of daily living she needs help with. The contact questions are filled in. Then enter twenty hours, add to the cart, check out, and confirm.',
        enter: function (H) { P.ensureAdd(H, false); P.fill(H, 0); delete S(H).form.answers.adlNeeds; delete S(H).form.qty; H.TM.render(); },
        target: function (H, doc) { var f = H.form(), r = H.route(); if (r.name === 'add' && !f.svc) return P.svcTarget(H); if (r.name === 'add' && !(f.answers.adlNeeds && f.answers.adlNeeds.length >= 2)) return doc.querySelector('#q-adlNeeds'); return finishTarget(H, doc); },
        tag: function (H) { var f = H.form(), r = H.route(); if (r.name === 'add' && !f.svc) return P.svcTag('Personal Care')(H); if (r.name === 'add' && !(f.answers.adlNeeds && f.answers.adlNeeds.length >= 2)) return 'Select the ADLs'; return finishTag(H); },
        done: function (H) { var r = P.newRef(H); return P.submittedDone(H) && !!r && r.hours === 20 && has(r.answers.adlNeeds, 'Bathing & personal hygiene') && has(r.answers.adlNeeds, 'Dressing & grooming'); } },

      /* ---------- Scenario 4: Companion Care ---------- */
      { id: 's4-start', blind: true, label: 'Scenario 4 of 4 · Task 1 of 3', kicker: 'Scenario 4 · Companion Care', au: 'kc_12_s4_start.mp3',
        h: 'Start the referral',
        sub: '<b>TEST-1006</b> lives at <b>Sample Partner Facility</b> and has dementia. Find the member, start a referral for the benefit that fits, and choose the service.',
        say: 'Scenario four. This member lives at Sample Partner Facility, and has dementia. Find the member, start a referral for the benefit that fits, and choose the service.',
        enter: function (H) { H.TM.reset(); H.TM.go({ name: 'home' }); },
        target: startTarget(C, 'Companion Care'), tag: startTag(C),
        done: function (H) { var r = H.route(), f = H.form(); return r.name === 'add' && r.id === C.MID && r.auth === H.authId(C.MID, 'CC40') && !!(f && f.svc); } },

      { id: 's4-questions', blind: true, label: 'Scenario 4 of 4 · Task 2 of 3', kicker: 'Scenario 4 · Companion Care', au: 'kc_13_s4_questions.mp3',
        h: 'Answer the facility questions',
        sub: 'Use these details and answer every question. <b>Facility:</b> Sample Partner Facility. <b>Contact:</b> Jordan Sample, Activities Director. <b>Phone and email:</b> 555-0150, sample@example.test. <b>Dates:</b> any weekday next week. <b>Times:</b> mornings between 9 and 11 AM. <b>Rules:</b> visitors check in at the front desk. <b>Condition:</b> dementia.',
        say: 'Now the facility questions. Use these details from the call. The facility is Sample Partner Facility. The contact is Jordan Sample, the activities director, and their number is five five five, zero one five zero, with the email sample at example dot test. Any weekday next week works, in the mornings, between nine and eleven. Visitors check in at the front desk. And the member has dementia. Answer every question.',
        enter: function (H) { C.ensureForm(H, -1); },
        target: function (H) { return C.missing(H, ['facility', 'facilityContact', 'facilityPhone', 'prefDates', 'prefTimes', 'facilityRules', 'ssbci']); }, tag: 'Answer this question',
        done: function (H) { var a = H.form().answers; return C.answered(H, ['facility', 'facilityContact', 'facilityPhone', 'prefDates', 'prefTimes', 'facilityRules']) && has(a.ssbci, 'Dementia'); } },

      { id: 's4-submit', blind: true, label: 'Scenario 4 of 4 · Task 3 of 3', kicker: 'Scenario 4 · Companion Care', au: 'kc_14_s4_submit.mp3',
        h: 'Set the hours and submit',
        sub: 'Enter <b>8</b> hours, add to cart, check out, and confirm.',
        say: 'Enter eight hours, add the referral to the cart, check out, and confirm.',
        enter: function (H) { C.ensureForm(H, 5); delete S(H).form.qty; H.TM.render(); },
        target: finishTarget, tag: finishTag,
        done: function (H) { var r = C.newRef(H); return C.submittedDone(H) && !!r && r.hours === 8; } },

      /* ---------- quiz ---------- */
      { t: 'intro', eyebrow: 'Knowledge check', h: 'Nice work on the scenarios',
        sub: 'You handled a referral for each of the four Aetna benefits. Now a short quiz: 10 questions, and you need <b>7</b> correct to pass. There is no limit on attempts.',
        au: 'kc_15_quiz_intro.mp3',
        say: 'Nice work on the scenarios. You handled a referral for each Aetna benefit. Now a short quiz. There are ten questions, you need seven correct to pass, and you can retake it as many times as you need. After each answer, you\'ll see an explanation, so even the ones you miss are a chance to learn.' }
    ].concat(quizScreens, [
      { t: 'results', auPass: 'kc_16_results_pass.mp3', auFail: 'kc_17_results_fail.mp3',
        sayPass: 'Nice work, you passed! Continue to see your certificate of completion. You can print it, or save it as a P-D-F.',
        sayFail: 'Almost there. You need at least seven out of ten to pass, and you can try again as many times as you like. Review the explanations, and give it another go.' },
      { t: 'certificate', au: 'kc_18_certificate.mp3', say: 'Congratulations! You\'ve completed the Aetna Benefits Hub training. Save or print your certificate. And whenever you need a refresher, the Resource Library has job aids and an F-A-Q for day-to-day questions.' }
    ])
  };
})();
