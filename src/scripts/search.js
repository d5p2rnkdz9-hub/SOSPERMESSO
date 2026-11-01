/* Ricerca nel menu — combobox ARIA con tendina di risultati.
   L'indice (/search-index.json, /{lang}/search-index.json) è generato in build
   da _data/searchIndex.js e viene scaricato solo al primo focus sul campo.
   Confronto senza maiuscole né accenti; in IT l'ultima voce rimanda alla
   ricerca delle circolari (/circolari.html?q=…). Nessuna dipendenza esterna. */
(function () {
  'use strict';

  var root = document.querySelector('.nav-search');
  if (!root) return;

  var form = root.querySelector('.nav-search__form');
  var toggle = root.querySelector('.nav-search__toggle');
  var input = root.querySelector('.nav-search__input');
  var list = root.querySelector('.nav-search__list');
  var status = root.querySelector('.nav-search__status');
  var circolariUrl = root.getAttribute('data-search-circolari');
  var MAX = 8;

  var T = {};
  try { T = JSON.parse(root.getAttribute('data-search-text')) || {}; } catch (e) { /* testi mancanti */ }
  var types = T.types || {};

  var index = null;      // voci con campi normalizzati
  var loading = null;    // promessa del fetch in corso
  var results = [];      // { href, el } delle opzioni mostrate
  var active = -1;

  // Minuscole, senza accenti latini né vocali brevi arabe (le stesse regole
  // valgono per l'indice e per la query, quindi il confronto resta coerente).
  function norm(s) {
    return String(s || '')
      .normalize('NFD')
      .replace(/[̀-ًͯ-ٰٟ]/g, '')
      .toLowerCase()
      .replace(/[’'`´]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function load() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;
    loading = fetch(root.getAttribute('data-search-index'))
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (items) {
        index = items.map(function (it) {
          return {
            t: it.t, u: it.u, k: it.k, s: it.s || '',
            nt: norm(it.t),
            na: norm(it.a),
            nb: norm((it.s || '') + ' ' + (it.w || ''))
          };
        });
        return index;
      })
      .catch(function () {
        loading = null;
        return [];
      });
    return loading;
  }

  // Punteggio: ogni parola deve comparire (titolo, titolo alternativo o testo);
  // il titolo pesa di più, l'inizio di parola più del caso in cui la parola è a metà.
  var KIND_BONUS = { permesso: 3, guida: 2, normativa: 1, dizionario: 0 };
  var WORD_START = /[\s(\-/«"“]/;

  // Ripiego per le parole lunghe: la radice senza le ultime due lettere a inizio
  // di parola («pregnancy» → «pregnant», «lavoro» → «lavorare»).
  function startsWord(text, stem) {
    var p = text.indexOf(stem);
    while (p >= 0) {
      if (p === 0 || WORD_START.test(text.charAt(p - 1))) return true;
      p = text.indexOf(stem, p + 1);
    }
    return false;
  }

  function score(item, q, words) {
    var total = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      var pt = item.nt.indexOf(w);
      var pa = item.na.indexOf(w);
      if (pt === 0) total += 30;
      else if (pt > 0) total += (WORD_START.test(item.nt.charAt(pt - 1)) ? 20 : 10);
      else if (pa >= 0) total += (pa === 0 || WORD_START.test(item.na.charAt(pa - 1)) ? 18 : 8);
      else if (item.nb.indexOf(w) >= 0) total += 3;
      else if (w.length >= 6 && startsWord(item.nt + ' ' + item.na, w.slice(0, -2))) total += 6;
      else if (w.length >= 6 && startsWord(item.nb, w.slice(0, -2))) total += 1;
      else return 0;
    }
    if (item.nt === q) total += 50;
    else if (item.nt.indexOf(q) === 0) total += 25;
    return total + (KIND_BONUS[item.k] || 0);
  }

  function search(raw) {
    var q = norm(raw);
    if (q.length < 2) return [];
    var words = q.split(' ');
    var hits = [];
    for (var i = 0; i < index.length; i++) {
      var sc = score(index[i], q, words);
      if (sc) hits.push({ item: index[i], sc: sc });
    }
    hits.sort(function (a, b) {
      return b.sc - a.sc || a.item.t.length - b.item.t.length;
    });
    return hits.slice(0, MAX).map(function (h) { return h.item; });
  }

  function setActive(i) {
    if (active >= 0 && results[active]) results[active].el.setAttribute('aria-selected', 'false');
    active = i;
    if (active >= 0 && results[active]) {
      var el = results[active].el;
      el.setAttribute('aria-selected', 'true');
      input.setAttribute('aria-activedescendant', el.id);
      el.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function close() {
    list.hidden = true;
    list.innerHTML = '';
    results = [];
    active = -1;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  function render() {
    var raw = input.value.trim();
    if (norm(raw).length < 2) {
      close();
      status.textContent = '';
      return;
    }
    var hits = search(raw);
    var html = '';
    hits.forEach(function (it, i) {
      html +=
        '<li role="none"><a role="option" id="nav-search-opt-' + i + '" class="nav-search__opt" href="' + esc(it.u) + '" tabindex="-1" aria-selected="false">' +
        '<span class="nav-search__type nav-search__type--' + esc(it.k) + '">' + esc(types[it.k] || it.k) + '</span>' +
        '<span class="nav-search__title">' + esc(it.t) + '</span>' +
        (it.s ? '<span class="nav-search__snippet">' + esc(it.s) + '</span>' : '') +
        '</a></li>';
    });
    if (!hits.length) {
      html += '<li role="none" class="nav-search__none">' + esc(T.none || '') + '</li>';
    }
    if (circolariUrl && T.circolari) {
      var label = T.circolari.replace('{q}', raw);
      html +=
        '<li role="none"><a role="option" id="nav-search-opt-circ" class="nav-search__opt nav-search__opt--circ" href="' +
        esc(circolariUrl + '?q=' + encodeURIComponent(raw)) + '" tabindex="-1" aria-selected="false">' +
        '<span class="nav-search__title">' + esc(label) + '</span></a></li>';
    }
    list.innerHTML = html;
    results = [].map.call(list.querySelectorAll('[role="option"]'), function (el) {
      return { href: el.getAttribute('href'), el: el };
    });
    active = -1;
    input.removeAttribute('aria-activedescendant');
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    status.textContent = hits.length ? (T.count || '{n}').replace('{n}', hits.length) : (T.none || '');
  }

  function update() {
    if (index) { render(); return; }
    load().then(render);
  }

  // Desktop stretto (769–1200px): il campo resta chiuso dietro la lente.
  function setOpen(open) {
    root.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      load();
      input.focus();
    }
  }

  toggle.addEventListener('click', function () {
    setOpen(!root.classList.contains('is-open'));
  });

  input.addEventListener('focus', function () {
    load();
    if (input.value.trim()) update();
  });
  input.addEventListener('input', update);

  input.addEventListener('keydown', function (e) {
    var n = results.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (list.hidden) { update(); return; }
      if (n) setActive(active < n - 1 ? active + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (n) setActive(active > 0 ? active - 1 : n - 1);
    } else if (e.key === 'Escape') {
      if (!list.hidden) {
        e.preventDefault();
        close();
      } else if (input.value) {
        e.preventDefault();
        input.value = '';
        status.textContent = '';
      } else if (root.classList.contains('is-open')) {
        e.preventDefault();
        setOpen(false);
        toggle.focus();
      }
    } else if (e.key === 'Tab') {
      close();
    }
  });

  // Invio: apre l'opzione evidenziata, altrimenti la prima.
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!input.value.trim()) return;
    var go = function () {
      if (!results.length) render();
      var target = results[active >= 0 ? active : 0];
      if (target) window.location.href = target.href;
    };
    if (index) go(); else load().then(function () { render(); go(); });
  });

  // L'opzione non deve togliere il focus al campo prima del clic
  list.addEventListener('mousedown', function (e) { e.preventDefault(); });

  document.addEventListener('click', function (e) {
    if (root.contains(e.target)) return;
    close();
    if (root.classList.contains('is-open') && !input.value) setOpen(false);
  });
})();
