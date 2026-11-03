/* Guided-module shell for Aetna trainings.
   Hosts the live Benefits Hub mock (bh-mock.html) in our module frame, tells the learner what to do,
   waits until they actually do it (Next stays locked until then), points at the control with a pink tag,
   and offers the right-side "Training scenarios" panel for free practice.
   A module supplies window.GUIDE_CONFIG (see recovery-at-home/module-4-create-referral/config.js). */
(function () {
  'use strict';
  var CFG = window.GUIDE_CONFIG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var stage = $('#stage'), next = $('#next'), back = $('#back'), au = $('#au');
  var audioToggle = $('#audioToggle'), hint = $('#readyHint'), bar = $('#bar'), stepnum = $('#stepnum');
  var AUDIO_DIR = 'assets/audio/';
  var ENGINE = CFG.engine || '../../engine/bh-mock.html';

  var screens = CFG.screens ? CFG.screens.map(function (s) { return s.t ? s : Object.assign({ t: 'step' }, s); })
    : [{ t: 'cover' }].concat(CFG.steps.map(function (s) { return Object.assign({ t: 'step' }, s); }), [{ t: 'outro' }]);
  var nSteps = screens.filter(function (s) { return s.t === 'step'; }).length;
  var learnerName = '', quizAnswered = {}, hintOn = {}, customNext = null;
  var i = 0, done = {}, practice = false, frame, TM = null, doc = null, win = null;
  var curTarget = null, tagEl = null, scrolledFor = null, started = {}, pendingEnter = false;

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  /* ---------- helpers handed to every step callback ---------- */
  var H = {
    get TM() { return TM; }, get doc() { return doc; },
    q: function (sel) { return doc ? doc.querySelector(sel) : null; },
    qa: function (sel) { return doc ? Array.prototype.slice.call(doc.querySelectorAll(sel)) : []; },
    S: function () { return TM.S; },
    route: function () { return TM.S.route; },
    member: function (id) { return TM.member(id); },
    authId: function (id, prog) { return TM.member(id).auths.find(function (a) { return a.program === prog; }).id; },
    openMember: function (id) { TM.S.search = ''; TM.S.expanded = null; TM.go({ name: 'member', id: id }); },
    selectTile: function (id, prog) { TM.S.tile[id] = H.authId(id, prog); TM.S.expanded = null; TM.render(); },
    startAdd: function (id, prog) { TM.startAdd(TM.member(id), H.authId(id, prog)); },
    form: function () { return TM.S.form; },
    setAnswer: function (key, val) { var f = TM.S.form; f.answers[key] = val; f.error = ''; TM.render(); },
    clearTextTyping: function () { /* reserved */ },
    sdqOptions: function (key) { return TM.CONFIG.sdqs[key].options; }
  };

  /* ---------- audio ---------- */
  function updateAudioBtn() {
    audioToggle.innerHTML = au.paused
      ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><span>Play narration</span>'
      : '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><span>Pause narration</span>';
  }
  function stopAu() { try { au.pause(); } catch (e) {} au.removeAttribute('src'); audioToggle.hidden = true; }
  function play(src) {
    stopAu();
    if (!src) return;
    au.onerror = function () { audioToggle.hidden = true; };       // narration not recorded yet: stay silent
    au.src = AUDIO_DIR + src; audioToggle.hidden = false; updateAudioBtn();
    var p = au.play(); if (p && p.catch) p.catch(function () { updateAudioBtn(); });
  }
  au.addEventListener('play', updateAudioBtn); au.addEventListener('pause', updateAudioBtn); au.addEventListener('ended', function () { updateAudioBtn(); if (!next.disabled) markReady(); });
  audioToggle.onclick = function () { if (au.paused) { if (au.ended) au.currentTime = 0; au.play().catch(function () {}); } else au.pause(); };

  function markReady() { hint.classList.add('show'); next.classList.add('ready'); }
  function clearReady() { hint.classList.remove('show'); next.classList.remove('ready'); }
  new MutationObserver(function () { if (!next.disabled) markReady(); }).observe(next, { attributes: true, attributeFilter: ['disabled'] });

  /* ---------- the embedded Benefits Hub ---------- */
  var HOT_CSS =
    '.gz-hot{outline:3px solid #CC4983!important;outline-offset:3px;border-radius:8px;animation:gzp 1.6s ease-in-out infinite}' +
    '@keyframes gzp{0%,100%{box-shadow:0 0 0 0 rgba(204,73,131,.4)}50%{box-shadow:0 0 0 9px rgba(204,73,131,0)}}' +
    '.gz-tag{position:absolute;z-index:2147483000;background:#CC4983;color:#fff;font:800 11.5px/1 system-ui,Arial,sans-serif;padding:6px 10px;border-radius:7px;white-space:nowrap;box-shadow:0 4px 10px -4px rgba(0,0,0,.4);pointer-events:none}' +
    '.gz-tag:after{content:"";position:absolute;left:14px;top:100%;border:6px solid transparent;border-top-color:#CC4983}' +
    '.gz-tag.r:after{left:auto;right:14px}' +
    '.gz-tag.below:after{top:auto;bottom:100%;border-top-color:transparent;border-bottom-color:#CC4983}' +
    '.gz-callout{position:absolute;z-index:2147482999;width:420px;background:#fff;border:2px solid #CC4983;border-radius:12px;padding:14px 16px;font:14.5px/1.45 system-ui,Arial,sans-serif;color:#1a1a1a;box-shadow:0 14px 34px -10px rgba(0,0,0,.4);pointer-events:none}' +
    '.gz-callout .ct{display:block;font-weight:800;font-size:15.5px;margin-bottom:10px;color:#003322}' +
    '.gz-callout .gg{display:grid;grid-template-columns:1fr 1fr;gap:10px 22px}.gz-callout .gi b{display:block;color:#003322;font-size:14.5px}' +
    '.gz-callout table{border-collapse:collapse;width:100%}.gz-callout td{padding:3px 0;vertical-align:top}.gz-callout td:first-child{font-weight:800;padding-right:12px;white-space:nowrap}';

  function onFrameLoad() {
    try { win = frame.contentWindow; TM = win.TM; doc = frame.contentDocument; } catch (e) { return; }
    if (!TM) return;
    var st = doc.createElement('style'); st.textContent = HOT_CSS; doc.head.appendChild(st);
    doc.body.classList.add('guided');
    buildDrawer();
    if (pendingEnter) { pendingEnter = false; enterStep(); }
  }

  function routeUrl() {
    var r = TM.S.route, base = 'yourcompany.benefitshub.com';
    if (r.name === 'member') return base + '/member/' + r.id;
    if (r.name === 'add') return base + '/referral/add';
    if (r.name === 'cart') return base + '/referral/cart';
    return base;
  }

  /* ---------- pointing at the control the learner needs next ---------- */
  var calloutEl = null;
  function clearCallout() { if (calloutEl && calloutEl.parentNode) calloutEl.parentNode.removeChild(calloutEl); calloutEl = null; }
  function positionCallout(t) {
    var r = t.getBoundingClientRect(), sx = win.scrollX, sy = win.scrollY, vw = doc.documentElement.clientWidth, vh = doc.documentElement.clientHeight;
    var w = calloutEl.offsetWidth, h = calloutEl.offsetHeight, left, top;
    if (r.right + 18 + w <= vw - 8) { left = r.right + 18; top = Math.max(8, Math.min(r.top - 10, vh - h - 8)); }
    else if (r.left - 18 - w >= 8) { left = r.left - 18 - w; top = Math.max(8, Math.min(r.top - 10, vh - h - 8)); }
    else { left = Math.max(8, Math.min(r.left, vw - w - 8)); top = r.bottom + 14; if (top + h > vh - 8) top = Math.max(8, r.top - h - 14); }
    calloutEl.style.left = (left + sx) + 'px'; calloutEl.style.top = (top + sy) + 'px';
  }
  function applyCallout(s, t) {
    if (!s.callout || practice || !t) { clearCallout(); return; }
    if (!calloutEl) { calloutEl = doc.createElement('div'); calloutEl.className = 'gz-callout'; calloutEl.innerHTML = s.callout; if (s.calloutWidth) calloutEl.style.width = s.calloutWidth + 'px'; doc.body.appendChild(calloutEl); }
    positionCallout(t);
  }
  function clearHot() {
    clearCallout();
    if (curTarget) { try { curTarget.classList.remove('gz-hot'); } catch (e) {} }
    if (tagEl && tagEl.parentNode) tagEl.parentNode.removeChild(tagEl);
    curTarget = null; tagEl = null;
  }
  function findTarget(s) {
    if (!s || !s.target || !doc) return null;
    try { return typeof s.target === 'function' ? s.target(H, doc) : doc.querySelector(s.target); } catch (e) { return null; }
  }
  function applyHot(s) {
    var t = (practice || (done[i] && !s.info) || (s.blind && !hintOn[i])) ? null : findTarget(s);
    if (t !== curTarget) {
      clearHot();
      if (t) {
        curTarget = t; t.classList.add('gz-hot');
        tagEl = doc.createElement('div'); tagEl.className = 'gz-tag'; tagEl.textContent = 'x'; doc.body.appendChild(tagEl);
        if (scrolledFor !== t) { scrolledFor = t; try { t.scrollIntoView({ block: (t.getBoundingClientRect().height > win.innerHeight - 90 ? 'start' : 'center'), behavior: 'smooth' }); } catch (e) {} }
      }
    }
    if (curTarget) applyCallout(s, curTarget);
    if (curTarget && tagEl) { var tx = typeof s.tag === 'function' ? s.tag(H) : (s.tag || 'Do this next'); if (tagEl.textContent !== tx) tagEl.textContent = tx; positionTag(); }
  }
  function positionTag() {
    var r = curTarget.getBoundingClientRect(), sx = win.scrollX, sy = win.scrollY;
    var tw = tagEl.offsetWidth, th = tagEl.offsetHeight, below = r.top - th - 12 < 4, right = r.width > tw + 28;
    tagEl.classList.toggle('below', below); tagEl.classList.toggle('r', right);
    var left = right ? r.right - tw : r.left + r.width / 2 - tw / 2;
    tagEl.style.left = Math.max(6, left + sx) + 'px';
    var tall = r.height > win.innerHeight - th - 40;   // a target taller than the view: pin the tag just inside its top edge so it stays on screen
    tagEl.style.top = (tall ? Math.max(r.top, 0) + 12 : below ? r.bottom + 12 : r.top - th - 12) + sy + 'px';
  }

  /* ---------- per-step state machine ---------- */
  function setNext(on) { next.disabled = !on; }
  function enterStep() {
    var s = screens[i];
    if (!TM) { pendingEnter = true; return; }
    if (s.enter) { try { s.enter(H); } catch (e) { console.error('enter failed', e); } }
    done[i] = false; scrolledFor = null; clearHot();
    check();
  }
  function check() {
    var s = screens[i];
    if (!s || s.t !== 'step' || !TM) return;
    $('#url').textContent = routeUrl();
    if (!done[i]) {
      var ok = practice || !s.done;
      if (!ok) { try { ok = !!s.done(H); } catch (e) { ok = false; } }
      if (ok) { done[i] = true; if (!s.info) clearHot(); }
    }
    setNext(done[i] || practice);
    $('#hintBtn').style.display = (s.blind && !hintOn[i] && !done[i] && !practice) ? 'inline-block' : 'none';
    applyHot(s);
  }
  setInterval(check, 220);
  (function loop() { if (curTarget && tagEl) { try { positionTag(); if (calloutEl) positionCallout(curTarget); } catch (e) {} } requestAnimationFrame(loop); })();

  /* The mock is designed for a wide browser. Render it at a comfortable virtual width and scale it to fit our frame, so the screens keep their real layout. */
  var VW = 1360;
  function fit() {
    var v = $('#bhview'); if (!v || !frame) return;
    var w = v.clientWidth, h = v.clientHeight; if (!w || !h) return;
    var sc = Math.max(0.7, Math.min(1, w / VW));
    frame.style.width = (w / sc) + 'px'; frame.style.height = (h / sc) + 'px';
    frame.style.transform = 'scale(' + sc + ')'; frame.style.transformOrigin = '0 0';
  }

  /* ---------- rendering ---------- */
  var coachWrap, coachEyebrow, coachH, coachSub, banner, gstage, ix;
  function buildStage() {
    ix = el('div', 'ix center'); ix.style.display = 'none'; stage.appendChild(ix);
    gstage = el('div', 'gstage');
    var coach = el('div', 'coach');
    coach.innerHTML = '<div class="eyebrow"><span class="dot"></span><span id="eyebrowTxt"></span></div><h1 class="hl" id="coachH"></h1><p class="sub" id="coachSub"></p><button type="button" class="hintbtn" id="hintBtn">Need a hint?</button>' +
      '<div class="practice-banner" id="banner"><span>Practice mode: the guided steps are paused. Use the scenarios panel, or explore freely.</span><button type="button" id="resumeBtn">Resume guided steps</button></div>';
    gstage.appendChild(coach);
    var fr = el('div', 'bhframe');
    fr.innerHTML = '<div class="bar"><div class="dots"><i></i><i></i><i></i></div><div class="url" id="url"></div></div>';
    var view = el('div', 'bhview'); view.id = 'bhview';
    frame = el('iframe'); frame.setAttribute('title', 'Benefits Hub training screen'); frame.setAttribute('allow', 'clipboard-write'); frame.src = ENGINE;
    view.appendChild(frame); fr.appendChild(view); gstage.appendChild(fr); stage.appendChild(gstage);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(view);
    window.addEventListener('resize', fit);
    frame.addEventListener('load', onFrameLoad);
    $('#resumeBtn').onclick = resumeGuided;
    $('#hintBtn').onclick = function () { hintOn[i] = true; $('#hintBtn').style.display = 'none'; check(); };
    banner = $('#banner');
  }

  /* ---------- assessment helpers: quiz scoring, name, certificate ---------- */
  var LTR = ['A', 'B', 'C', 'D', 'E'];
  function stepNumber(idx) { var n = 0; for (var k = 0; k <= idx; k++) if (screens[k].t === 'step') n++; return n; }
  function quizIdxs() { var a = []; screens.forEach(function (s, k) { if (s.t === 'quiz') a.push(k); }); return a; }
  function quizStats() { var q = quizIdxs(), c = 0; q.forEach(function (k) { if (quizAnswered[k] && quizAnswered[k].ok) c++; }); var need = Math.ceil(q.length * 0.7); return { correct: c, total: q.length, need: need, passed: c >= need }; }
  function ensureCertSheet() {
    if (document.getElementById('certSheet') || !CFG.certificate) return;
    var d = el('div'); d.id = 'certSheet';
    d.innerHTML = '<div class="cs-eyebrow">' + CFG.certificate.org + '</div><h1>Certificate of Completion</h1><p class="cs-sub">This certifies that</p><div class="cs-name" id="csName">&nbsp;</div>' +
      '<p class="cs-desc">' + CFG.certificate.desc + '</p><div class="cs-footrow"><div><b id="csDate">&nbsp;</b>Date completed</div><div><b>The Helper Bees</b>Training Team</div></div>';
    document.body.appendChild(d);
  }
  function updateCertSheet() {
    ensureCertSheet();
    var n = document.getElementById('csName'), dt = document.getElementById('csDate');
    if (n) n.textContent = learnerName || '';
    if (dt) { var d = new Date(), m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; dt.textContent = m[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); }
  }

  function renderOther(s) {
    var wrap = el('div', 'wrap');
    var c = s.t === 'cover' ? CFG.cover : s.t === 'outro' ? CFG.outro : null;
    if (s.t === 'cover') {
      wrap.innerHTML = '<div class="cover-badge"><img src="' + CFG.logo + '" alt="" style="width:20px;height:20px;flex:none;">' + (c.badge || 'Benefits Hub') + '</div>' +
        '<h1 class="hl">' + c.title + '</h1><p class="sub">' + c.sub + '</p>' +
        '<div class="cover-meta">' + (c.meta || []).map(function (m) { return '<div><b>' + m[0] + '</b><span>' + m[1] + '</span></div>'; }).join('') + '</div>';
      ix.appendChild(wrap); setNext(true); play(c.au);
    } else if (s.t === 'outro') {
      wrap.innerHTML = '<div class="eyebrow"><span class="dot"></span>' + (c.eyebrow || 'All set') + '</div><h1 class="hl">' + c.title + '</h1><p class="sub">' + c.sub + '</p>' +
        (c.links && c.links.length ? '<div style="margin-top:22px"><div class="eyebrow" style="margin-bottom:10px"><span class="dot"></span>Keep these handy</div><div style="display:flex;gap:12px;flex-wrap:wrap">' +
          c.links.map(function (l) { return '<a class="reslink" href="' + l.href + '" target="_blank" rel="noopener"><span>' + l.label + '</span></a>'; }).join('') + '</div></div>' : '');
      ix.appendChild(wrap); setNext(true); play(c.au);
    } else if (s.t === 'name') {
      wrap.innerHTML = '<div class="eyebrow"><span class="dot"></span>Before we begin</div><h1 class="hl">What\'s your name?</h1><p class="sub">We\'ll add this to your certificate of completion once you pass the knowledge check.</p>' +
        '<div class="namebox"><label for="nameInput">Full name</label><input type="text" id="nameInput" placeholder="Jane Doe" autocomplete="name"><div class="namehint">This stays in your browser for this session only. It isn\'t sent anywhere.</div></div>';
      ix.appendChild(wrap);
      var inp = $('#nameInput'); inp.value = learnerName; setNext(!!learnerName.trim());
      inp.oninput = function () { learnerName = inp.value; setNext(!!learnerName.trim()); updateCertSheet(); };
      setTimeout(function () { inp.focus(); }, 50); play(s.au);
    } else if (s.t === 'intro') {
      wrap.className = 'wrap wide';
      wrap.innerHTML = '<div class="eyebrow"><span class="dot"></span>' + (s.eyebrow || '') + '</div><h1 class="hl">' + s.h + '</h1><p class="sub">' + s.sub + '</p>' +
        (s.cards ? '<div class="howsteps">' + s.cards.map(function (k) { return '<div class="hs"><div class="hn">' + k.n + '</div><b>' + k.b + '</b><span>' + k.s + '</span></div>'; }).join('') + '</div>' : '');
      ix.appendChild(wrap); setNext(true); play(s.au);
    } else if (s.t === 'quiz') {
      wrap.className = 'wrap wide';
      var ans = quizAnswered[i];
      wrap.innerHTML = '<div class="eyebrow"><span class="dot"></span>' + s.eyebrow + '</div><div class="q">' + s.q + '</div>';
      s.opts.forEach(function (o, k) {
        var b = el('button', 'opt'); b.type = 'button'; b.innerHTML = '<span class="ltr">' + LTR[k] + '</span><span>' + o.label + '</span>';
        if (ans) { b.disabled = true; if (o.correct) b.classList.add('correct'); else if (ans.pick === k) b.classList.add('wrong'); }
        else b.onclick = function () { quizAnswered[i] = { pick: k, ok: !!o.correct }; render(); };
        wrap.appendChild(b);
      });
      if (ans) { var an = el('div', 'answer'); an.innerHTML = '<b>' + (ans.ok ? 'Correct. ' : 'Not quite. ') + '</b>' + s.explain; wrap.appendChild(an); }
      ix.appendChild(wrap); setNext(!!ans); if (!ans) play(s.au);
    } else if (s.t === 'results') {
      var st = quizStats(); wrap.className = 'wrap';
      wrap.innerHTML = '<div class="eyebrow"><span class="dot"></span>Your results</div><h1 class="hl">' + (st.passed ? 'Nice work!' : 'Almost there') + '</h1><div class="scorebig">' + st.correct + ' / ' + st.total + '</div><p class="sub">questions correct</p>' +
        (st.passed ? '<div class="resultbanner pass">You passed. You needed ' + st.need + ' of ' + st.total + ' correct (70%). Continue to view and save your certificate of completion.</div>'
                   : '<div class="resultbanner fail">You need at least ' + st.need + ' of ' + st.total + ' correct (70%) to pass. Review and try again. There is no limit on attempts.</div>');
      ix.appendChild(wrap); setNext(true);
      if (st.passed) next.textContent = 'View Certificate'; else { next.textContent = 'Retry Quiz'; customNext = function () { quizAnswered = {}; i = quizIdxs()[0]; render(); }; }
      play(st.passed ? s.auPass : s.auFail);
    } else if (s.t === 'certificate') {
      updateCertSheet();
      var first = learnerName ? ', ' + learnerName.split(' ')[0] : '';
      wrap.innerHTML = '<div class="eyebrow"><span class="dot"></span>All set</div><h1 class="hl">Congratulations' + first + '!</h1><p class="sub">' + CFG.certificate.congrats + '</p>' +
        '<div class="certpreview"><div class="certeyebrow">' + CFG.certificate.org + '</div><h2>Certificate of Completion</h2><p>This certifies that</p><div class="certname">' + (learnerName || 'Your Name') + '</div><p>' + CFG.certificate.desc + '</p>' +
        '<div class="cert-actions"><button class="cert-btn" id="printCertBtn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>Print or save as PDF</button>' +
        '<a class="cert-link" href="' + CFG.certificate.libraryHref + '">Go to Resource Library</a></div>' +
        '<div class="printhint">Clicking Print opens your browser\'s print dialog. Choose "Save as PDF" as the destination to download it instead of printing.</div></div>';
      ix.appendChild(wrap); $('#printCertBtn').onclick = function () { updateCertSheet(); window.print(); };
      setNext(false); next.textContent = 'Finish'; play(s.au);
    }
  }

  function render() {
    var s = screens[i];
    stopAu(); clearReady(); clearHot(); customNext = null; next.textContent = 'Next';
    back.disabled = i === 0;
    bar.style.width = Math.round((i / (screens.length - 1)) * 100) + '%';
    var qi = quizIdxs().indexOf(i);
    stepnum.textContent = s.t === 'step' ? (s.label || ('Step ' + stepNumber(i) + ' of ' + nSteps)) : (s.t === 'quiz' ? 'Question ' + (qi + 1) + ' of ' + quizIdxs().length : '');
    if (s.t === 'step') {
      ix.style.display = 'none'; gstage.classList.add('show');
      $('#eyebrowTxt').textContent = s.kicker || ('Step ' + stepNumber(i));
      $('#coachH').innerHTML = s.h; $('#coachSub').innerHTML = s.sub;
      banner.classList.toggle('show', practice);
      fit(); setNext(false); enterStep(); play(s.au);
    } else {
      gstage.classList.remove('show'); ix.style.display = 'flex'; ix.innerHTML = '';
      renderOther(s);
    }
  }

  next.onclick = function () {
    if (next.disabled) return;
    if (customNext) { customNext(); return; }
    if (i < screens.length - 1) { i++; render(); } else { window.location.href = CFG.finishHref; }
  };
  back.onclick = function () { if (i > 0) { i--; render(); } };

  /* ---------- Training scenarios panel (free practice) ---------- */
  var drawer = null;
  function buildDrawer() {
    if (drawer || !CFG.scenarios || !CFG.scenarios.length) return;
    drawer = el('aside', 'scn-drawer'); drawer.setAttribute('aria-label', 'Training scenarios');
    var items = CFG.scenarios.map(function (k) {      // a scenario can be named by its title (safe if the SME reorders) or by position
      var idx = typeof k === 'string' ? TM.SCENARIOS.findIndex(function (s) { return s.t === k; }) : k;
      return idx >= 0 ? { k: idx, s: TM.SCENARIOS[idx] } : null;
    }).filter(Boolean);
    drawer.innerHTML = '<header><h2>Training scenarios</h2><button type="button" id="scnClose" aria-label="Close">&times;</button></header><div class="scn-body">' +
      '<div class="scn-legend">Today in this training is <b>' + TM.fmt(TM.CONFIG.today) + '</b>. Hours and points are the same thing for these programs. Starting a scenario resets the practice data and pauses the guided steps.</div>' +
      items.map(function (x) {
        return '<div class="scn"><h3>' + TM.esc(x.s.t) + '</h3><p>' + TM.esc(x.s.why) + '</p><ol>' + x.s.steps.map(function (t) { return '<li>' + TM.esc(t) + '</li>'; }).join('') +
          '</ol><div class="row"><span class="meta">Member ' + x.s.who + '</span><button type="button" class="go" data-scn="' + x.k + '">Start</button></div></div>';
      }).join('') + '</div>';
    document.body.appendChild(drawer);
    $('#scnClose').onclick = function () { drawer.classList.remove('open'); };
    Array.prototype.forEach.call(drawer.querySelectorAll('[data-scn]'), function (b) { b.onclick = function () { startScenario(Number(b.dataset.scn)); }; });
  }
  var scnBtn = $('#scnBtn');
  if (scnBtn && (!CFG.scenarios || !CFG.scenarios.length)) scnBtn.style.display = 'none';
  if (scnBtn) scnBtn.onclick = function () { if (drawer) drawer.classList.toggle('open'); };
  function startScenario(k) {
    if (!TM) return;
    if (screens[i].t !== 'step') { i = 1; render(); }
    practice = true; clearHot();
    doc.body.classList.remove('guided'); doc.body.classList.add('practice');
    TM.startScenario(k);
    banner.classList.add('show'); setNext(true);
    if (window.innerWidth < 900 && drawer) drawer.classList.remove('open');
  }
  function resumeGuided() {
    practice = false; doc.body.classList.add('guided'); doc.body.classList.remove('practice');
    banner.classList.remove('show'); enterStep();
  }

  /* ---------- start ---------- */
  buildStage();
  $('#startBtn').onclick = function () { $('#startOverlay').classList.add('hide'); render(); };
  window.__GUIDE = { H: H, screens: screens, get i() { return i; }, get practice() { return practice; }, get done() { return !!done[i]; } }; // for automated QA
})();
