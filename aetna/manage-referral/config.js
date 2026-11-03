/* Managing a Referral. Follows the SME mock, including the "Keep the referral up to date" scenario.
   Part 1 (TEST-1001, Personal Care): read a referral. Part 2: keep it up to date (narrative, note, document, tracking link, email).
   Part 3 (TEST-1001, Recovery at Home): record the discharge date. The Recovery at Home referral is created for the learner and
   backdated to 3/2/2027 so the discharge date can be entered after it (the mock's "today" is fixed at 3/10/2027).
   Status meanings come from the validated status glossary in the earlier Aetna Module 5, plus On Hold and Eligibility Failed.
   `say` = narration script, `sub` = on-screen caption. */
(function () {
  var MID = 'TEST-1001', PC = 'IHSPC80', RAH = 'RAH60';
  var R = GuideKit({ member: MID, program: RAH, qty: 60,
    groups: [['bestNumber', 'pp1_name', 'pp1_rel', 'pp1_phi'], ['hospital', 'anticipatedDischarge', 'careNeeded'], ['dx'], ['supportNeeds']] });

  function S(H) { return H.TM.S; }
  function pcRef(H) { return H.member(MID).referrals.filter(function (r) { return r.program === PC; })[0]; }
  function rahRef(H) { return H.member(MID).referrals.filter(function (r) { return r.program === RAH; })[0]; }
  function tidy(H) { H.TM.closeDialog(); H.qa('.menu').forEach(function (m) { m.remove(); }); S(H).editing = null; S(H).editNarr = null; }

  /* put the app on the member page, Personal Care tile selected, referral expanded or not */
  function freshPC(H, tile, expand) {
    tidy(H);
    if (rahRef(H) || !(S(H).route.name === 'member' && S(H).route.id === MID)) { H.TM.reset(); H.openMember(MID); }
    var s = S(H);
    if (tile) H.selectTile(MID, PC); else { delete s.tile[MID]; s.expanded = null; }
    s.expanded = expand ? pcRef(H).id : null; H.TM.render();
  }
  /* same for the Recovery at Home referral (created for the learner and backdated, as if submitted a few days ago) */
  function ensureRah(H, tile, expand) {
    tidy(H);
    if (!rahRef(H)) { R.submit(H); var r = rahRef(H); r.received = '2027-03-02'; r.expires = '2027-04-01'; }
    if (!(S(H).route.name === 'member' && S(H).route.id === MID)) H.openMember(MID);
    var s = S(H);
    if (tile) H.selectTile(MID, RAH); else { delete s.tile[MID]; }
    s.expanded = expand ? rahRef(H).id : null; H.TM.render();
  }
  function openDischarge(H) { if (!H.q('#dDate')) { tidy(H); H.TM.refAction(H.member(MID), rahRef(H), 'discharge'); } }
  function ensureDischargeSaved(H) { var r = rahRef(H); if (!r.discharge) { r.discharge = '2027-03-08'; r.expires = '2027-04-07'; } }

  /* pointer helpers: Add / View buttons, then the menu item, then whatever the dialog needs */
  function btnThenItem(btn, act) { return function (H, doc) { return doc.querySelector('.menu [data-act="' + act + '"]') || doc.querySelector(btn); }; }
  function btnTag(btnLabel, itemLabel) { return function (H) { return H.q('.menu') ? 'Select ' + itemLabel : 'Select ' + btnLabel; }; }
  function byText(sel, rx) { return function (H, doc) { return Array.prototype.slice.call(doc.querySelectorAll(sel)).filter(function (e) { return rx.test(e.textContent); })[0] || null; }; }
  function kvValue(label) { return function (H, doc) { var k = Array.prototype.slice.call(doc.querySelectorAll('.kv .k')).filter(function (e) { return e.textContent.trim() === label; })[0]; return k ? k.nextElementSibling : null; }; }

  var narrBase = '';
  var STATUS_CARD = '<span class="ct">What each status means</span><div class="gg">' + [
    ['New', 'Referral has been created and is awaiting approval.'],
    ['Approved', 'The system recognizes the referral but it hasn\'t been assigned to a local provider yet.'],
    ['Assigned to Provider', 'A provider was found in the service area and alerted (they have 3 days to respond).'],
    ['Accepted By Provider', 'The provider has accepted. Contact info can be shared with the member.'],
    ['Unable to Contact', 'The provider couldn\'t reach the member after 3 attempts.'],
    ['Member Declined Services', 'The member declined the provider that reached out.'],
    ['Completed', 'All rate types have been invoiced and billed for the service.'],
    ['Closed', 'The service was refunded and the referral is now inactive.'],
    ['On Hold', 'Personal Care is paused while Recovery at Home is open. It resumes when Recovery at Home ends.'],
    ['Eligibility Failed', 'The referral was closed. On a readmission, Benefits Hub closes the old referral this way when you submit the new one, and its unused hours expire.']
  ].map(function (r) { return '<div class="gi"><b>' + r[0] + '</b>' + r[1] + '</div>'; }).join('') + '</div>';

  window.GUIDE_CONFIG = {
    engine: '../engine/bh-mock.html',
    logo: '../assets/img/bee-icon.png',
    finishHref: '../Begin-Training.html',
    scenarios: ['Keep the referral up to date', 'Refer a member to Recovery at Home'],

    cover: {
      badge: 'Benefits Hub',
      title: 'Managing a Referral',
      sub: 'Once a referral exists, you read it, keep it up to date, and, for Recovery at Home, record the discharge date. In this module you will do all three on the real Benefits Hub screens.',
      meta: [['~20 minutes', 'self-paced'], ['3 parts', 'read, update, discharge date']],
      au: 'mr_00_cover.mp3',
      say: 'Creating a referral is only the beginning. After that, you\'ll be reading referrals, keeping them current, and, for Recovery at Home, recording the discharge date. This module covers all three, in three parts. We\'ll start with a member who has an active personal care referral, then practice keeping it up to date, and finish with the Recovery at Home discharge date, which changes how long a referral lasts. As always, it\'s a training member, so nothing here is real.'
    },

    steps: [
      /* ---------------- Part 1: read a referral ---------------- */
      { id: 'tile', au: 'mr_01_tile.mp3', kicker: 'Part 1 · Read a referral',
        h: 'Open the Personal Care benefit',
        sub: 'Start with a member who already has a Personal Care referral. This is <b>TEST-1001</b>. Select the <b>In-Home Support Personal Care</b> tile.',
        say: 'Let\'s start with a member who already has a personal care referral. Click the personal care tile.',
        enter: function (H) { freshPC(H, false, false); },
        target: '.tile[title="In-Home Support Personal Care"]', tag: 'Select this benefit',
        done: function (H) { return S(H).tile[MID] === H.authId(MID, PC); } },

      { id: 'expand', au: 'mr_02_expand.mp3', kicker: 'Part 1 · Read a referral',
        h: 'Open the referral',
        sub: 'The referral is listed under the authorization. Select the <b>arrow</b> at the end of its row to expand the details.',
        say: 'The referral is listed under the authorization. To see everything about it, click the arrow at the end of its row.',
        enter: function (H) { freshPC(H, true, false); },
        target: '[data-expand]', tag: 'Expand the referral',
        done: function (H) { return S(H).expanded === pcRef(H).id; } },

      { id: 'status', au: 'mr_03_status.mp3', info: true, kicker: 'Part 1 · Read a referral',
        h: 'Understand the status',
        sub: 'The <b>Status</b> shows where the referral is. This one is <b>Accepted By Provider</b>. The card shows what each status means.',
        say: 'The first thing to check on any referral is its status, because it tells you where things stand. This one says Accepted by Provider, which means a provider has taken the referral, and contact information can be shared with the member. The card shows every status and what it means, so take a moment to read through it. Two are worth noticing. On Hold means personal care is paused while Recovery at Home is open. And Eligibility Failed is what you saw when a readmission closed an older referral.',
        enter: function (H) { freshPC(H, true, true); },
        target: function (H, doc) { return doc.querySelector('.exp .kv .chip'); }, tag: 'Status',
        callout: STATUS_CARD, calloutWidth: 760 },

      { id: 'provider', au: 'mr_04_provider.mp3', info: true, kicker: 'Part 1 · Read a referral',
        h: 'Check the provider',
        sub: '<b>Service Provider</b> shows who is assigned to the member. Once the status is <b>Accepted By Provider</b>, the provider\'s contact information can be shared with the member.',
        say: 'Next, the service provider, which shows who is assigned to the member. Once a referral is Accepted by Provider, that provider\'s contact information can be shared with the member. Before that point, don\'t tell the member that services are scheduled, because a provider hasn\'t confirmed yet.',
        enter: function (H) { freshPC(H, true, true); },
        target: kvValue('Service Provider'), tag: 'Service Provider' },

      { id: 'balance', au: 'mr_05_balance.mp3', info: true, kicker: 'Part 1 · Read a referral',
        h: 'Check the hours and key dates',
        sub: '<b>Encounter Summary</b> shows the hours <b>Allowed</b>, <b>Used</b>, and <b>Remaining</b> on this referral. <b>Key Dates</b> shows when it was received, assigned, and accepted.',
        say: 'Now the numbers. Encounter summary shows how many hours are allowed, used, and remaining on this referral. Here, eighty are allowed and eighteen are used. Key dates shows the referral\'s timeline: when it was received, assigned, and accepted. Together, these tell you how much care has happened, and how long the referral has been moving.',
        enter: function (H) { freshPC(H, true, true); },
        target: '.exp .enc', tag: 'Hours' },

      { id: 'encounters', au: 'mr_06_encounters.mp3', info: true, kicker: 'Part 1 · Read a referral',
        h: 'Review the encounters',
        sub: '<b>Encounters</b> lists each completed visit with its date, status, and hours. This member has six visits of 3 hours each, which adds up to the 18 hours used.',
        say: 'At the bottom, encounters lists every completed visit, with the date, status, and hours. This member has six visits of three hours each, which adds up to the eighteen hours used. If a member or family asks what\'s been delivered so far, this is where you find the answer.',
        enter: function (H) { freshPC(H, true, true); },
        target: function (H, doc) { var h = byText('.exp h3', /^Encounters$/)(H, doc); return h ? (h.nextElementSibling || h) : null; }, tag: 'Visits' },

      /* ---------------- Part 2: keep it up to date ---------------- */
      { id: 'narrative', au: 'mr_07_narrative.mp3', kicker: 'Part 2 · Keep it up to date',
        h: 'Update the referral narrative',
        sub: 'You can write and edit the <b>referral narrative</b>, up to 250 characters. Select the <b>pencil</b>, change the text, and select <b>Save</b>. The first line, which points providers to the Service Detail Questions, is added for you and stays in place.',
        say: 'Now, keeping the referral current. First, the narrative. Care managers can write and edit it, up to two hundred fifty characters. Click the pencil, change the text, and click Save. The first line, which points providers to the service questions, is added for you and stays in place. Use the narrative for context that helps whoever is working the referral, like a change in the member\'s situation.',
        enter: function (H) { freshPC(H, true, true); narrBase = pcRef(H).narrative; },
        target: function (H, doc) {
          if (S(H).editNarr == null) return doc.querySelector('[data-edit-narr]');
          var ta = doc.querySelector('#narrInput'); return ta && ta.value !== ta.defaultValue ? doc.querySelector('[data-save-narr]') : ta; },
        tag: function (H) { if (S(H).editNarr == null) return 'Select the pencil'; var ta = H.q('#narrInput'); return ta && ta.value !== ta.defaultValue ? 'Select Save' : 'Change the text'; },
        done: function (H) { return S(H).editNarr == null && pcRef(H).narrative !== narrBase; } },

      { id: 'note', au: 'mr_08_note.mp3', kicker: 'Part 2 · Keep it up to date',
        h: 'Add a note',
        sub: 'Select <b>Add</b>, then <b>Add Note</b>. Choose a <b>note type</b>, write a short note, and select <b>Save Note</b>. <b>Adding a note does not alert The Helper Bees.</b> Notes record information within the referral. If something needs action, submit a Zendesk ticket instead.',
        say: 'Notes are for recording what\'s happening on a referral. Click Add, then Add Note. Choose a note type, such as a visit scheduled or member outreach in progress, then write a short note, and click Save Note. One important thing: adding a note does not alert The Helper Bees. A note is a record, not a request. If something needs someone to act, submit a Zendesk ticket instead.',
        enter: function (H) { freshPC(H, true, true); },
        target: function (H, doc) {
          if (doc.querySelector('#saveNote')) { var ty = doc.querySelector('#noteType'), tx = doc.querySelector('#noteText'); return !ty.value ? ty : (!tx.value.trim() ? tx : doc.querySelector('#saveNote')); }
          return btnThenItem('.actbtn.add', 'note')(H, doc); },
        tag: function (H) {
          if (H.q('#saveNote')) { if (!H.q('#noteType').value) return 'Choose a note type'; return H.q('#noteText').value.trim() ? 'Select Save Note' : 'Write a note'; }
          return btnTag('Add', 'Add Note')(H); },
        done: function (H) { return pcRef(H).notes.length > 0; } },

      { id: 'document', au: 'mr_09_document.mp3', kicker: 'Part 2 · Keep it up to date',
        h: 'Add a document',
        sub: 'Select <b>Add</b>, then <b>Add Document</b>. Use it for proof of POA or TPA, a discharge summary, or authorization paperwork. <b>Documents are visible to the THB coordinator.</b> In this training you can select <b>Upload</b> without choosing a file.',
        say: 'Documents let you attach paperwork to the referral. Click Add, then Add Document. Typical examples are proof of P-O-A or T-P-A paperwork, a discharge summary, or authorization paperwork. These documents are visible to the Helper Bees coordinator. In this training, you can click Upload without choosing a file.',
        enter: function (H) { freshPC(H, true, true); },
        target: function (H, doc) { return doc.querySelector('#saveDoc') || btnThenItem('.actbtn.add', 'doc')(H, doc); },
        tag: function (H) { return H.q('#saveDoc') ? 'Select Upload' : btnTag('Add', 'Add Document')(H); },
        done: function (H) { return pcRef(H).docs.length > 0; } },

      { id: 'tracking', au: 'mr_10_tracking.mp3', kicker: 'Part 2 · Keep it up to date',
        h: 'Share the tracking link',
        sub: 'Select <b>View</b>, then <b>Copy Tracking Link</b> to share the referral\'s status with the member or their family. <b>Members and families can open it without logging in.</b>',
        say: 'Here\'s a handy one for conversations with families. Click View, then Copy Tracking Link. That gives you a link you can share, and members and families can open it without logging in to see where the referral stands. It\'s a good way to answer the question, where do things stand, without a phone call.',
        enter: function (H) {
          freshPC(H, true, true); H.doc.__tracked = false;
          if (!H.doc.__trackBound) { H.doc.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-act="track"]'); if (b) H.doc.__tracked = true; }, true); H.doc.__trackBound = true; }
        },
        target: btnThenItem('.actbtn.view', 'track'), tag: btnTag('View', 'Copy Tracking Link'),
        done: function (H) { return !!H.doc.__tracked; } },

      { id: 'email', au: 'mr_11_email.mp3', kicker: 'Part 2 · Keep it up to date',
        h: 'Add the member\'s email',
        sub: 'In the member\'s <b>Overview</b>, select the <b>pencil</b> next to <b>Email</b>, type an address, and select the <b>check mark</b>. You can add or correct a member\'s email at any time.',
        say: 'You can also keep the member\'s contact details current. In the Overview at the top of the page, click the pencil next to email, type the address, and click the check mark. Care managers can add or correct a member\'s email, so if you notice it\'s missing, this is how you fix it.',
        enter: function (H) { freshPC(H, true, false); H.member(MID).email = ''; H.TM.render(); },
        target: function (H, doc) { if (S(H).editing !== MID + ':email') return doc.querySelector('[data-edit-contact="email"]'); var i = doc.querySelector('#ed-email'); return i && i.value.trim() ? doc.querySelector('[data-save-contact="email"]') : i; },
        tag: function (H) { if (S(H).editing !== MID + ':email') return 'Select the pencil'; var i = H.q('#ed-email'); return i && i.value.trim() ? 'Select the check mark' : 'Type an email address'; },
        done: function (H) { return !!H.member(MID).email; } },

      /* ---------------- Part 3: the Recovery at Home discharge date ---------------- */
      { id: 'rah-tile', au: 'mr_12_rah_tile.mp3', kicker: 'Part 3 · Record the discharge date',
        h: 'A Recovery at Home referral',
        sub: 'Now a Recovery at Home referral for this member, created a few days ago. Select the <b>Recovery at Home</b> tile.',
        say: 'Part three is the one with the most moving pieces: the Recovery at Home discharge date. We\'ve set up a Recovery at Home referral for this member that was created a few days ago. Click the Recovery at Home tile.',
        enter: function (H) { ensureRah(H, false, false); },
        target: '.tile[title="Recovery at Home"]', tag: 'Select this benefit',
        done: function (H) { return S(H).tile[MID] === H.authId(MID, RAH); } },

      { id: 'rah-expand', au: 'mr_13_rah_expand.mp3', kicker: 'Part 3 · Record the discharge date',
        h: 'Open the referral',
        sub: 'Select the <b>arrow</b> at the end of the row to expand the details.',
        say: 'Click the arrow to expand the referral.',
        enter: function (H) { ensureRah(H, true, false); },
        target: '[data-expand]', tag: 'Expand the referral',
        done: function (H) { return S(H).expanded === rahRef(H).id; } },

      { id: 'rah-expiry', au: 'mr_14_rah_expiry.mp3', info: true, kicker: 'Part 3 · Record the discharge date',
        h: 'Check the expiration',
        sub: 'Until a discharge date is recorded, a Recovery at Home referral expires <b>30 days after submission</b>, and never later than 12/31. This one was received 3/2, so it expires <b>4/1/2027</b>. Under <b>Key Dates</b>, <b>Date Discharged</b> is empty, with a <b>Record</b> link.',
        say: 'Look at the effective period. Until a discharge date is recorded, a Recovery at Home referral expires thirty days after submission, and never later than December thirty-first. This one was received March second, so it expires April first. Now look at key dates. Date discharged is empty, with a record link. That\'s what we\'re about to fill in, and it will change the expiration.',
        enter: function (H) { ensureRah(H, true, true); },
        target: kvValue('Effective Period'), tag: 'Expires 4/1/2027' },

      { id: 'dd-open', au: 'mr_15_dd_open.mp3', kicker: 'Part 3 · Record the discharge date',
        h: 'Open the Discharge date box',
        sub: 'Select <b>Add</b>, then <b>Discharge date</b>. This option is only on Recovery at Home referrals. The <b>Record</b> link under Key Dates opens the same box.',
        say: 'Click Add, then Discharge date. This option appears only on Recovery at Home referrals. The record link next to date discharged opens the very same box, so you can use either one.',
        enter: function (H) { ensureRah(H, true, true); },
        target: btnThenItem('.actbtn.add', 'discharge'), tag: btnTag('Add', 'Discharge date'),
        done: function (H) { return !!H.q('#dDate'); } },

      { id: 'dd-enter', au: 'mr_16_dd_enter.mp3', kicker: 'Part 3 · Record the discharge date',
        h: 'Enter the discharge date',
        sub: 'Enter the date the member was <b>discharged to home</b>: <b>3/8/2027</b>. Before you save, the box shows the new expiration. Benefits Hub does not allow a future date.',
        say: 'Enter the date the member was discharged home, which is March eighth. Before you save, the box shows how the expiration will change, so you can check the result before committing. It also won\'t accept a date in the future.',
        enter: function (H) { ensureRah(H, true, true); openDischarge(H); },
        target: '#dDate', tag: 'Enter 3/8/2027',
        done: function (H) { var b = H.q('#saveD'), d = H.q('#dDate'); return !!(b && d && d.value && !b.disabled); } },

      { id: 'dd-save', au: 'mr_17_dd_save.mp3', kicker: 'Part 3 · Record the discharge date',
        h: 'Save the date',
        sub: 'The box says the expiration will change from <b>4/1/2027</b> to <b>4/7/2027</b>, which is 30 days after the discharge date. Select <b>Save</b>.',
        say: 'Look at what the box says. The expiration will change from April first to April seventh, which is thirty days after the discharge date. That\'s the rule: once the discharge date is recorded, the referral runs thirty days from it, with day one being the day after discharge. Click Save.',
        enter: function (H) { ensureRah(H, true, true); openDischarge(H); var d = H.q('#dDate'); if (d && !d.value) { d.value = '2027-03-08'; d.dispatchEvent(new Event('input')); } },
        target: '#saveD', tag: 'Select Save',
        done: function (H) { return !!rahRef(H).discharge; } },

      { id: 'dd-after', au: 'mr_18_dd_after.mp3', info: true, kicker: 'Part 3 · Record the discharge date',
        h: 'See the new expiration',
        sub: 'The referral now expires <b>30 days after the discharge date</b>: <b>4/7/2027</b>. <b>Key Dates</b> shows <b>Date Discharged</b> as 3/8/2027. The <b>Discharge date</b> option stays in the <b>Add</b> menu, so you can correct the date later.',
        say: 'Done. The referral now expires April seventh, and key dates shows March eighth as the date discharged. And notice that the Discharge date option is still in the Add menu. That\'s intentional, so if you ever record the wrong date, you can come back and correct it.',
        enter: function (H) { ensureRah(H, true, true); ensureDischargeSaved(H); H.TM.render(); },
        target: kvValue('Effective Period'), tag: 'Now expires 4/7/2027' },

      { id: 'dd-blocked', au: 'mr_19_dd_blocked.mp3', kicker: 'Part 3 · Record the discharge date',
        h: 'See what Benefits Hub blocks',
        sub: 'Open <b>Add</b> > <b>Discharge date</b> again and enter <b>1/1/2027</b>. That date would make the referral already expired, so it is blocked and the box tells you to <b>contact THB</b>.',
        say: 'Benefits Hub also protects you from mistakes. Open Add, Discharge date again, and try January first. That date would make the referral already expired, so Benefits Hub blocks it and tells you to contact the Helper Bees. If you ever see that message, a ticket is the right next step.',
        enter: function (H) { ensureRah(H, true, true); ensureDischargeSaved(H); H.TM.render(); },
        target: function (H, doc) { return doc.querySelector('#dDate') || btnThenItem('.actbtn.add', 'discharge')(H, doc); },
        tag: function (H) { return H.q('#dDate') ? 'Enter 1/1/2027' : btnTag('Add', 'Discharge date')(H); },
        done: function (H) { var w = H.q('#dPrev .alert.warn'); return !!(w && /already expired/.test(w.textContent)); } },

      { id: 'dd-warn', au: 'mr_20_dd_warn.mp3', kicker: 'Part 3 · Record the discharge date',
        h: 'See the earlier-date warning',
        sub: 'Now enter <b>2/28/2027</b>. It is allowed, but it moves the expiration <b>earlier</b>, so Benefits Hub warns you: save only if the member was discharged before the referral was created. Then select <b>Cancel</b>.',
        say: 'Now try February twenty-eighth. This date is allowed, but it moves the expiration earlier than it is today, so Benefits Hub warns you, and the button changes to Save anyway. The warning says to save only if the member was discharged before the referral was created. So it\'s a gut-check: make sure the date is right before you override it. For now, click Cancel.',
        enter: function (H) { ensureRah(H, true, true); ensureDischargeSaved(H); H.TM.render(); openDischarge(H); },
        target: function (H, doc) { return doc.querySelector('#dDate'); }, tag: 'Enter 2/28/2027',
        done: function (H) { var w = H.q('#dPrev .alert.warn'), b = H.q('#saveD'); return !!(w && /earlier/.test(w.textContent) && b && /Save anyway/.test(b.textContent)); } },

      { id: 'sdq', au: 'mr_21_sdq.mp3', kicker: 'Part 3 · Record the discharge date',
        h: 'See the answers submitted',
        sub: 'Select <b>View</b>, then <b>View SDQ</b> to see the answers submitted with the referral. <b>View Notes</b> and <b>View Documents</b> in the same menu list what has been added.',
        say: 'One last tool. To see the answers that were submitted with a referral, click View, then View S-D-Q. S-D-Q stands for service detail questions. In that same menu, View Notes and View Documents show everything you\'ve added to the referral.',
        enter: function (H) { ensureRah(H, true, true); ensureDischargeSaved(H); H.TM.render(); },
        target: function (H, doc) { return doc.querySelector('.menu [data-act="sdq"]') || doc.querySelector('.actbtn.view'); },
        tag: function (H) { return H.q('.menu') ? 'Select View SDQ' : 'Select View'; },
        done: function (H) { var l = H.q('#layer'); return !!(l && /SDQ Answers/.test(l.textContent)); } }
    ],

    outro: {
      eyebrow: 'All set',
      title: 'You can manage a referral.',
      sub: 'You read a Personal Care referral, kept it up to date with a narrative, a note, a document, the tracking link, and the member\'s email, and you recorded the discharge date on a Recovery at Home referral.',
      links: [{ href: '../resources/Managing a Referral - Job Aid.pdf', label: 'Job aid: Managing a Referral' }],
      au: 'mr_22_outro.mp3',
      say: 'You can now read a referral, keep it current with the narrative, notes, documents, tracking link, and email, and record a Recovery at Home discharge date, including what Benefits Hub blocks and what it warns about. The Managing a Referral job aid is linked here. Next, what to do when something can\'t be solved inside Benefits Hub.'
    }
  };
})();
