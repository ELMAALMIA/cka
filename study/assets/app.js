/* Shared study app: topic list, page chrome, quiz engine, progress storage. */
(function () {
  'use strict';

  var TOPICS = [
    { id: 'architecture',  file: '01-architecture.html',    title: 'Cluster Architecture & kubectl',        exams: ['CKA', 'CKAD'] },
    { id: 'pods',          file: '02-pods-config.html',     title: 'Pods, ConfigMaps, Secrets & Resources', exams: ['CKA', 'CKAD'] },
    { id: 'workloads',     file: '03-workloads.html',       title: 'Deployments, Jobs & Rollouts',          exams: ['CKA', 'CKAD'] },
    { id: 'scheduling',    file: '04-scheduling.html',      title: 'Scheduling, Taints & Affinity',         exams: ['CKA'] },
    { id: 'networking',    file: '05-networking.html',      title: 'Services, Ingress & NetworkPolicy',     exams: ['CKA', 'CKAD'] },
    { id: 'storage',       file: '06-storage.html',         title: 'Storage: Volumes, PV, PVC',             exams: ['CKA', 'CKAD'] },
    { id: 'security',      file: '07-security.html',        title: 'RBAC, ServiceAccounts & Security',      exams: ['CKA', 'CKAD'] },
    { id: 'observability', file: '08-observability.html',   title: 'Probes, Logs & Debugging',              exams: ['CKA', 'CKAD'] },
    { id: 'maintenance',   file: '09-maintenance.html',     title: 'kubeadm, Upgrades & etcd Backup',       exams: ['CKA'] },
    { id: 'troubleshoot',  file: '10-troubleshooting.html', title: 'Troubleshooting Clusters',              exams: ['CKA'], note: 'Largest CKA domain, 30% of the score' },
    { id: 'tooling',       file: '11-helm-kustomize.html',  title: 'Helm, Kustomize, CRDs & Images',        exams: ['CKA', 'CKAD'] },
    { id: 'exam',          file: '12-exam-tips.html',       title: 'Imperative kubectl & Exam Strategy',    exams: ['CKA', 'CKAD'] }
  ];
  var KEY = 'k8s-study-progress-v1';

  /* Seven-spoke helm, the Kubernetes motif. */
  var HELM_ICON = (function () {
    var s = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="9.5" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="16" cy="16" r="3" fill="currentColor"/>';
    for (var i = 0; i < 7; i++) {
      var a = (i / 7) * Math.PI * 2 - Math.PI / 2;
      s += '<line x1="' + (16 + Math.cos(a) * 3).toFixed(2) + '" y1="' + (16 + Math.sin(a) * 3).toFixed(2) + '" x2="' + (16 + Math.cos(a) * 14.5).toFixed(2) + '" y2="' + (16 + Math.sin(a) * 14.5).toFixed(2) + '" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>';
    }
    return s + '</svg>';
  })();

  function loadProgress() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function saveProgress(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* storage blocked: scores will not persist */ } }
  function resetProgress() { try { localStorage.removeItem(KEY); } catch (e) {} }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  /* escape, then turn `code` spans into <code> */
  function fmt(s) { return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>'); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function band(pct) { return pct == null ? 'none' : pct >= 80 ? 'good' : pct >= 50 ? 'mid' : 'low'; }
  function chips(exams) { return exams.map(function (e) { return '<span class="chip ' + e.toLowerCase() + '">' + e + '</span>'; }).join(' '); }
  function examsText(exams) { return exams.join(' and '); }
  function topicIndex(id) { for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) return i; return -1; }

  /* ---------- top bar ---------- */
  function buildTopBar(i, page) {
    var head = document.querySelector('header.top'); if (!head) return;
    var where = i >= 0 ? '<span class="where">Topic ' + (i + 1) + ' of ' + TOPICS.length + '</span>' : '';
    head.innerHTML =
      '<div class="bar"><a class="brand" href="index.html">' + HELM_ICON + '<span>K8s Study</span></a>' + where +
      '<nav class="nav" aria-label="Main"><a href="index.html"' + (page === 'home' ? ' aria-current="page"' : '') + '>Topics</a>' +
      '<a href="mock-exam.html"' + (page === 'mock' ? ' aria-current="page"' : '') + '>Mock exam</a></nav></div>' +
      (i >= 0 ? '<div class="trail" aria-hidden="true"><span style="width:' + Math.round(100 * (i + 1) / TOPICS.length) + '%"></span></div>' : '');
  }

  /* ---------- code blocks and tables ---------- */
  function highlightComments(pre) {
    var code = pre.querySelector('code') || pre;
    code.innerHTML = code.innerHTML.split('\n').map(function (line) {
      var q = null;
      for (var k = 0; k < line.length; k++) {
        var ch = line[k];
        if (q) { if (ch === q) q = null; continue; }
        if (ch === '"' || ch === "'") { q = ch; continue; }
        if (ch === '#' && (k === 0 || /\s/.test(line[k - 1]))) {
          return line.slice(0, k) + '<span class="c">' + line.slice(k) + '</span>';
        }
      }
      return line;
    }).join('\n');
  }
  function enhanceBlocks(root) {
    Array.prototype.forEach.call(root.querySelectorAll('pre'), function (pre) {
      highlightComments(pre);
      if (!navigator.clipboard) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'copy'; b.textContent = 'Copy';
      b.addEventListener('click', function () {
        var text = (pre.querySelector('code') || pre).innerText;
        navigator.clipboard.writeText(text).then(function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1400); });
      });
      pre.appendChild(b);
    });
    Array.prototype.forEach.call(root.querySelectorAll('table'), function (t) {
      if (t.parentNode.classList.contains('table-wrap')) return;
      var w = document.createElement('div'); w.className = 'table-wrap'; t.parentNode.insertBefore(w, t); w.appendChild(t);
    });
  }

  /* ---------- lesson page layout ---------- */
  function buildLesson(i) {
    var t = TOPICS[i], main = document.querySelector('main'), lesson = document.querySelector('.lesson');
    if (!main || !lesson) return;
    var h1 = lesson.querySelector('h1'), lead = lesson.querySelector('p.lead'), badge = lesson.querySelector('.badge');
    if (badge) badge.remove();

    var head = document.createElement('div'); head.className = 'lesson-head';
    head.innerHTML = '<div class="numeral" aria-hidden="true">' + pad2(i + 1) + '</div><div>' +
      '<div class="meta">' + chips(t.exams) + (t.note ? '<span>' + esc(t.note) + '</span>' : '') + '</div></div>';
    var right = head.lastChild;
    if (h1) right.appendChild(h1);
    if (lead) right.appendChild(lead);

    var layout = document.createElement('div'); layout.className = 'layout';
    var side = document.createElement('nav'); side.className = 'side'; side.setAttribute('aria-label', 'On this page');
    var content = document.createElement('div'); content.className = 'content';
    var quiz = document.getElementById('quiz-section');

    var items = '';
    Array.prototype.forEach.call(lesson.querySelectorAll('h2'), function (h, k) {
      if (!h.id) h.id = 'sec-' + (k + 1);
      items += '<li><a href="#' + h.id + '">' + esc(h.textContent) + '</a></li>';
    });
    if (quiz) {
      var qh = quiz.querySelector('h2'); if (qh) qh.textContent = 'Check your understanding';
      var qp = quiz.querySelector('p'); if (qp) qp.textContent = 'Pick one answer, or every answer that applies when the question says so. Each answer comes with an explanation, and your best score is saved in this browser.';
      items += '<li class="side-quiz"><a href="#quiz-section">Quiz</a></li>';
    }
    side.innerHTML = '<h2>On this page</h2><ol>' + items + '</ol><div class="best">Your best score<span class="score-text" data-best></span></div>';

    main.innerHTML = '';
    main.appendChild(head);
    content.appendChild(lesson);
    if (quiz) content.appendChild(quiz);
    layout.appendChild(side); layout.appendChild(content);
    main.appendChild(layout);
    enhanceBlocks(lesson);
    scrollSpy(side, content);

    var foot = document.querySelector('footer.bottom');
    if (foot) {
      var prev = TOPICS[i - 1], next = TOPICS[i + 1];
      foot.className = 'pager';
      foot.innerHTML =
        (prev ? '<a class="prev" href="' + prev.file + '"><small>Previous topic</small><strong>' + esc(prev.title) + '</strong></a>' : '') +
        (next ? '<a class="next" href="' + next.file + '"><small>Next topic</small><strong>' + esc(next.title) + '</strong></a>'
              : '<a class="next" href="mock-exam.html"><small>All topics covered</small><strong>Take the mock exam</strong></a>');
    }
  }

  function scrollSpy(side, content) {
    if (!('IntersectionObserver' in window)) return;
    var links = {}, heads = [];
    Array.prototype.forEach.call(side.querySelectorAll('a'), function (a) { links[a.getAttribute('href').slice(1)] = a; });
    Array.prototype.forEach.call(content.querySelectorAll('.lesson h2, #quiz-section'), function (h) { heads.push(h); });
    var current = null;
    var obs = new IntersectionObserver(function () {
      var top = null;
      heads.forEach(function (h) { if (h.getBoundingClientRect().top < window.innerHeight * 0.3) top = h; });
      var id = top ? top.id : heads[0] && heads[0].id;
      if (id !== current) {
        if (current && links[current]) links[current].classList.remove('active');
        if (links[id]) links[id].classList.add('active');
        current = id;
      }
    }, { rootMargin: '0px 0px -60% 0px', threshold: [0, 1] });
    heads.forEach(function (h) { obs.observe(h); });
  }

  function refreshBest(id) {
    var p = loadProgress()[id];
    Array.prototype.forEach.call(document.querySelectorAll('[data-best]'), function (el) {
      el.className = 'score-text ' + band(p ? p.best : null);
      el.textContent = p ? p.best + '%' : 'Not taken yet';
    });
  }

  /* ---------- quiz engine ---------- */
  function isMulti(q) { return Array.isArray(q.answer) && q.answer.length > 1; }

  function renderQuiz(bankId, mountId, opts) {
    var bank = (window.QUIZ_BANKS || {})[bankId], mount = document.getElementById(mountId || 'quiz');
    if (!bank || !mount) return;
    buildQuiz(mount, bank, bankId, opts || {});
  }

  function buildQuiz(mount, bank, bankId, opts) {
    mount.innerHTML = '';
    var form = document.createElement('form'); form.className = 'quiz'; form.setAttribute('novalidate', '');
    var result = document.createElement('div'); result.className = 'result'; result.hidden = true; result.setAttribute('role', 'status');
    form.appendChild(result);
    bank.forEach(function (q, i) {
      var multi = isMulti(q);
      var fs = document.createElement('fieldset'); fs.className = 'q'; fs.setAttribute('data-i', i);
      var meta = '<div class="q-meta"><span>Question ' + (i + 1) + ' of ' + bank.length + '</span>' +
        (multi ? '<span class="multi">Select all that apply</span>' : '') +
        (opts.showTopic && q._topic ? '<span class="topic-tag">' + esc(q._topic) + '</span>' : '') + '</div>';
      var html = '<legend class="visually-hidden">Question ' + (i + 1) + ': </legend>' + meta + '<p class="q-text" aria-hidden="true">' + fmt(q.q) + '</p><div class="choices">';
      q.choices.forEach(function (c, j) {
        html += '<label class="choice"><input type="' + (multi ? 'checkbox' : 'radio') + '" name="q' + i + '" value="' + j + '"><span>' + fmt(c) + '</span><span class="mark"></span></label>';
      });
      fs.innerHTML = html + '</div><div class="explain" hidden></div>';
      fs.querySelector('legend').insertAdjacentText('beforeend', q.q.replace(/`/g, ''));
      form.appendChild(fs);
    });
    var bar = document.createElement('div'); bar.className = 'quiz-bar';
    bar.innerHTML = '<span class="answered"><b>0</b> of ' + bank.length + ' answered<span class="meter"><span style="width:0%"></span></span></span>' +
      '<button type="button" class="btn quiet" data-reset>Start over</button><button type="submit" class="btn primary">Check answers</button>';
    form.appendChild(bar);
    form.addEventListener('change', function () {
      var n = 0;
      Array.prototype.forEach.call(form.querySelectorAll('fieldset.q'), function (f) { if (f.querySelector('input:checked')) n++; });
      bar.querySelector('.answered b').textContent = n;
      bar.querySelector('.meter span').style.width = Math.round(100 * n / bank.length) + '%';
      if (typeof opts.onChange === 'function') opts.onChange(n, bank.length);
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); if (!form.classList.contains('graded')) gradeQuiz(form, bank, bankId, opts); });
    bar.querySelector('[data-reset]').addEventListener('click', function () {
      buildQuiz(mount, bank, bankId, opts);
      mount.scrollIntoView({ block: 'start' });
    });
    mount.appendChild(form);
  }

  function gradeQuiz(form, bank, bankId, opts) {
    var correct = 0, perTopic = {};
    form.classList.add('graded');
    bank.forEach(function (q, i) {
      var ans = [].concat(q.answer).map(Number).sort(function (a, b) { return a - b; });
      var fs = form.querySelector('fieldset[data-i="' + i + '"]');
      var picked = Array.prototype.map.call(fs.querySelectorAll('input:checked'), function (x) { return +x.value; }).sort(function (a, b) { return a - b; });
      var ok = picked.length === ans.length && picked.every(function (v, k) { return v === ans[k]; });
      if (ok) correct++;
      if (q._topic) { perTopic[q._topic] = perTopic[q._topic] || { ok: 0, n: 0 }; perTopic[q._topic].n++; if (ok) perTopic[q._topic].ok++; }
      fs.classList.add(ok ? 'ok' : 'bad');
      Array.prototype.forEach.call(fs.querySelectorAll('.choice'), function (l, j) {
        var isAns = ans.indexOf(j) >= 0, isWrong = picked.indexOf(j) >= 0 && !isAns;
        l.classList.toggle('is-answer', isAns);
        l.classList.toggle('is-wrong', isWrong);
        l.querySelector('.mark').textContent = isAns ? (picked.indexOf(j) >= 0 ? 'Your answer, correct' : 'Correct answer') : isWrong ? 'Your answer' : '';
      });
      Array.prototype.forEach.call(fs.querySelectorAll('input'), function (inp) { inp.disabled = true; });
      var ex = fs.querySelector('.explain'); ex.hidden = false;
      ex.innerHTML = '<span class="verdict">' + (ok ? 'Correct.' : (picked.length ? 'Not quite.' : 'Not answered.')) + '</span>' + fmt(q.explain || '');
    });
    var pct = Math.round(100 * correct / bank.length);
    var best = pct;
    if (bankId && !opts.noSave) {
      var p = loadProgress(), prev = p[bankId] || {};
      best = Math.max(prev.best || 0, pct);
      p[bankId] = { best: best, last: pct, attempts: (prev.attempts || 0) + 1, at: Date.now() };
      saveProgress(p); refreshBest(bankId);
    }
    var verdict = pct >= 80 ? 'Solid. You are ready to move on.' : pct >= 50 ? 'Getting there. Review the explanations marked in red, then try again.' : 'Reread the lesson, then try again.';
    var result = form.querySelector('.result');
    result.className = 'result ' + band(pct); result.hidden = false;
    result.innerHTML = '<span class="big">' + pct + '%</span><p class="verdict">' + verdict + '</p><p class="muted">' + correct + ' of ' + bank.length + ' correct' +
      (bankId && !opts.noSave ? '. Best score ' + best + '%.' : '.') + '</p>';
    form.querySelector('button[type=submit]').disabled = true;
    form.querySelector('[data-reset]').textContent = 'Try again';
    if (typeof opts.onGraded === 'function') opts.onGraded({ correct: correct, total: bank.length, pct: pct, perTopic: perTopic });
    result.scrollIntoView({ block: 'center' });
  }

  /* ---------- public API ---------- */
  window.Study = {
    TOPICS: TOPICS, HELM_ICON: HELM_ICON, loadProgress: loadProgress, saveProgress: saveProgress, resetProgress: resetProgress,
    renderQuiz: renderQuiz, esc: esc, fmt: fmt, pad2: pad2, band: band, chips: chips, examsText: examsText, isMulti: isMulti
  };

  document.addEventListener('DOMContentLoaded', function () {
    var id = document.body.getAttribute('data-topic'), page = document.body.getAttribute('data-page');
    var i = topicIndex(id);
    buildTopBar(i, page);
    if (i >= 0) {
      buildLesson(i);
      refreshBest(id);
      if (document.getElementById('quiz')) renderQuiz(id, 'quiz');
    }
  });
})();
