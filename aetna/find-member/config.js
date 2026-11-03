/* Finding and reviewing a member: member TEST-1001 (Personal Care and Recovery at Home tiles).
   Replaces the old Module 3, whose screenshots showed the three old tile names. Advanced Search is taught in text because the mock has no such screen.
   `say` = narration script, `sub` = on-screen caption. */
(function () {
  var MID = 'TEST-1001', PC = 'IHSPC80', RAH = 'RAH60';
  function S(H) { return H.TM.S; }
  function memberPage(H, tile) {
    H.TM.closeDialog();
    if (!(S(H).route.name === 'member' && S(H).route.id === MID)) { H.TM.reset(); H.openMember(MID); }
    if (tile) H.selectTile(MID, tile); else { delete S(H).tile[MID]; S(H).expanded = null; H.TM.render(); }
  }
  function byText(sel, rx) { return function (H, doc) { return Array.prototype.slice.call(doc.querySelectorAll(sel)).filter(function (e) { return rx.test(e.textContent.trim()); })[0] || null; }; }
  function card(sel, rx) { return function (H, doc) { var e = byText(sel, rx)(H, doc); return e ? (e.closest('.card') || e.parentElement) : null; }; }

  window.GUIDE_CONFIG = {
    engine: '../engine/bh-mock.html',
    logo: '../assets/img/bee-icon.png',
    finishHref: '../Begin-Training.html',
    scenarios: [],

    cover: {
      badge: 'Benefits Hub',
      title: 'Finding and Reviewing a Member',
      sub: 'Everything starts with the member. In this module you will search for a member, read their landing page, and compare their benefit tiles and authorizations on the real Benefits Hub screens.',
      meta: [['~8 minutes', 'self-paced'], ['4 benefits', 'one tile for each']],
      au: 'fm_00_cover.mp3',
      say: 'Everything in Benefits Hub starts with the member. Whether you\'re creating a referral or checking on one, the first thing you\'ll do is find the right person, and make sure you\'re looking at the right benefit. In this short module, you\'ll search for a member, read their landing page, and learn how to compare their benefits. We\'ll use a training member, so nothing here is real.'
    },

    steps: [
      { id: 'advanced', au: 'fm_01_advanced.mp3', info: true,
        h: 'Search by member number',
        sub: 'The fastest way to find a member is the <b>member number</b>. No number handy? Use <b>Advanced Search</b> instead: first name, last name, and date of birth. <b>All three are required.</b> Case managers can\'t search by just one or two of them.',
        say: 'There are two ways to find a member. The fastest is by member number, so if you have it, use it. If you don\'t, there\'s Advanced Search, where you enter the member\'s first name, last name, and date of birth. All three are required, so you can\'t search with just a name or just a birthday. That keeps the results specific, so you land on the right person.',
        enter: function (H) { H.TM.closeDialog(); H.TM.reset(); H.TM.go({ name: 'home' }); },
        target: '#searchForm', tag: 'Search by member number' },

      { id: 'search', au: 'fm_02_search.mp3',
        h: 'Find the member',
        sub: 'Type the training member number <b>TEST-1001</b> in the search box and press Enter.',
        say: 'Let\'s try it. Click the search box, type the member number, test dash one zero zero one, and press Enter. This is a training member, so go ahead.',
        enter: function (H) { H.TM.closeDialog(); H.TM.reset(); H.TM.go({ name: 'home' }); },
        target: '#memberSearch', tag: 'Type TEST-1001',
        done: function (H) { var r = H.route(); return r.name === 'member' && r.id === MID; } },

      { id: 'overview', au: 'fm_03_overview.mp3', info: true,
        h: 'Read the Overview',
        sub: 'The <b>Overview</b> holds the member\'s key details: full name, date of birth, address, phone, email, and preferred language. Check here first. You can add or correct the email with the pencil next to it.',
        say: 'This is the member\'s landing page. The top card, called Overview, holds their key details: name, date of birth, address, phone, email, and preferred language. Make it a habit to glance here first. Confirming you have the right person before you touch a referral saves a lot of trouble later. You\'ll also see a pencil next to email. Care managers can add or correct a member\'s email right there, and you\'ll practice that in a later module.',
        enter: function (H) { memberPage(H, null); },
        target: card('.card h2', /^Overview$/), tag: 'Overview' },

      { id: 'recent', au: 'fm_04_recent.mp3', info: true,
        h: 'Check Recent Activity',
        sub: '<b>Recent Activity</b>, on the right, keeps you posted on what has changed on the account, such as the last authorization update and recent referrals.',
        say: 'On the right is Recent Activity. Think of it as the what\'s-changed section of the account. It shows things like the last time an authorization was updated and the most recent referrals. It\'s a quick way to see whether anything new has happened before you dig into a benefit.',
        enter: function (H) { memberPage(H, null); },
        target: card('.t', /Recent Activity/), tag: 'Recent Activity' },

      { id: 'tiles', au: 'fm_05_tiles.mp3', info: true,
        h: 'See the benefit tiles',
        sub: 'Each <b>tile</b> is one benefit the member is eligible for. This member has two: <b>In-Home Support Personal Care</b> and <b>Recovery at Home</b>. Aetna has four benefits in all, and a member does not have all four.',
        say: 'Now the heart of this page: the benefit tiles. Each tile is one benefit this member is eligible for. This member has two, personal care and Recovery at Home. Aetna has four benefits in all: personal care, post-discharge, Recovery at Home, and companion care. But a member won\'t have all four, so you only see the tiles that apply to the person in front of you.',
        enter: function (H) { memberPage(H, null); },
        target: function (H, doc) { var t = doc.querySelector('.tile'); return t ? t.parentElement : null; }, tag: 'Benefit tiles' },

      { id: 'tile-pc', au: 'fm_06_tilepc.mp3',
        h: 'Open the Personal Care tile',
        sub: 'Select the <b>In-Home Support Personal Care</b> tile to see that benefit\'s authorization.',
        say: 'Let\'s open one. Click the personal care tile. When you select a tile, everything below it changes to show that benefit\'s authorization and its referrals.',
        enter: function (H) { memberPage(H, null); },
        target: '.tile[title="In-Home Support Personal Care"]', tag: 'Select this benefit',
        done: function (H) { return S(H).tile[MID] === H.authId(MID, PC); } },

      { id: 'auth', au: 'fm_07_auth.mp3', info: true,
        h: 'Read the authorization',
        sub: 'The authorization shows <b>Plan Allowance</b> (80), <b>Used</b> (18), <b>Pending</b> (62), and <b>Remaining</b> (0) hours. <b>Pending</b> counts hours already reserved by open referrals on this authorization. It does not mean a referral hasn\'t been entered yet. This benefit\'s referrals are listed below.',
        say: 'Here\'s the authorization, which works like the member\'s balance for this benefit. Four numbers matter. Plan allowance is the total hours. Used is what\'s been used so far. Pending is hours already set aside for open referrals. And remaining is what\'s left. In this example, eighty hours are allowed, eighteen are used, sixty-two are pending, and none are remaining. Pending trips people up. It doesn\'t mean a referral is waiting to be entered. It means hours are already reserved for referrals that exist. And below the numbers, you\'ll see this benefit\'s referrals.',
        enter: function (H) { memberPage(H, PC); },
        target: '.authrow', tag: 'Hours' },

      { id: 'tile-rah', au: 'fm_08_tilerah.mp3',
        h: 'Compare the Recovery at Home tile',
        sub: 'Select the <b>Recovery at Home</b> tile to compare.',
        say: 'Now click the Recovery at Home tile, so you can compare the two.',
        enter: function (H) { memberPage(H, PC); },
        target: '.tile[title="Recovery at Home"]', tag: 'Select this benefit',
        done: function (H) { return S(H).tile[MID] === H.authId(MID, RAH); } },

      { id: 'compare', au: 'fm_09_compare.mp3', info: true,
        h: 'Each benefit has its own authorization',
        sub: 'Recovery at Home has its own authorization: <b>60</b> hours, none used, and no referrals yet. Each benefit has its own hours and its own referrals, so <b>open the tile for the benefit you are working on</b> before you add or review a referral.',
        say: 'Notice what changed. Recovery at Home has its own authorization: sixty hours, none used, and no referrals yet. That\'s the key idea. Every benefit has its own hours and its own referrals. So before you add or review a referral, always open the tile for the benefit you\'re working on. It\'s the easiest way to avoid working in the wrong place.',
        enter: function (H) { memberPage(H, RAH); },
        target: '.authrow', tag: 'A separate authorization' }
    ],

    outro: {
      eyebrow: 'All set',
      title: 'You can find and review a member.',
      sub: 'You searched for a member, read the landing page, and compared two benefit tiles and their authorizations. Next you will create referrals, one benefit at a time.',
      links: [{ href: '../resources/Finding Your Member - Job Aid.pdf', label: 'Job aid: Finding Your Member' }],
      au: 'fm_10_outro.mp3',
      say: 'Now you can find a member, read their landing page, and tell their benefits apart. That\'s the foundation for everything else. Next, you\'ll start creating referrals, one benefit at a time, beginning with Recovery at Home. The Finding Your Member job aid is linked on this screen if you want it handy.'
    }
  };
})();
