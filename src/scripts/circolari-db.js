/* Circolari e prassi amministrativa — ricerca e filtri client-side.
   Carica circolari-db.json (generato in build da _data/circolariDb.js) e
   filtra in memoria. Nessuna dipendenza esterna. */
(function () {
  'use strict';

  var mount = document.getElementById('circ-app');
  if (!mount) return;

  var PAGE = 50;
  var permitNames = {};
  try {
    var permitsEl = document.getElementById('circ-permits-json');
    if (permitsEl) permitNames = JSON.parse(permitsEl.textContent);
  } catch (e) { /* select permessi resta vuota */ }

  var state = { q: '', ente: '', permesso: '', anno: '', shown: PAGE };
  var docs = [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtDate(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
  }

  function matches(d) {
    if (state.anno && d.anno !== state.anno) return false;
    if (state.ente && d.ente !== state.ente) return false;
    if (state.permesso) {
      var hit = false;
      for (var i = 0; i < d.permessi.length; i++) {
        if (d.permessi[i].slug === state.permesso) { hit = true; break; }
      }
      if (!hit && !d.trasversale) return false;
    }
    if (state.q) {
      var hay = (d.titolo + ' ' + (d.oggetto || '') + ' ' + (d.tema || '') + ' ' +
        (d.ente || '') + ' ' + (d.numero || '') + ' ' + (d.t || '')).toLowerCase();
      var terms = state.q.toLowerCase().split(/\s+/);
      for (var t = 0; t < terms.length; t++) {
        if (terms[t] && hay.indexOf(terms[t]) === -1) return false;
      }
    }
    return true;
  }

  function itemHtml(d) {
    var meta = '';
    if (d.data) meta += '<span class="leg-item-date">' + fmtDate(d.data) + '</span>';
    if (d.ente) meta += '<span class="leg-badge leg-badge--circolare">' + esc(d.ente) + '</span>';

    var title = '<a href="' + esc(d.slug) + '.html">' + esc(d.titolo || '(senza titolo)') + '</a>';

    var chips = '';
    for (var i = 0; i < d.permessi.length; i++) {
      var slug = d.permessi[i].slug;
      var name = permitNames[slug] || slug;
      chips += '<span class="leg-permit-chip">' + esc(name) + '</span>';
    }
    if (d.trasversale) chips += '<span class="leg-permit-chip">tutti i permessi</span>';

    return '<li class="leg-item">' +
      '<div class="leg-item-meta">' + meta + '</div>' +
      '<p class="leg-item-title">' + title + '</p>' +
      (d.oggetto ? '<p class="leg-item-oggetto">' + esc(d.oggetto) + '</p>' : '') +
      (chips ? '<div class="leg-item-permits">' + chips + '</div>' : '') +
      '</li>';
  }

  function render() {
    var hits = docs.filter(matches);
    var countEl = document.getElementById('circ-count');
    countEl.textContent = hits.length === 1 ? '1 documento trovato' : hits.length + ' documenti trovati';

    var list = document.getElementById('circ-list');
    if (!hits.length) {
      list.innerHTML = '';
      document.getElementById('circ-empty').hidden = false;
      document.getElementById('circ-more').hidden = true;
      return;
    }
    document.getElementById('circ-empty').hidden = true;
    var shown = hits.slice(0, state.shown);
    var html = '';
    for (var i = 0; i < shown.length; i++) html += itemHtml(shown[i]);
    list.innerHTML = html;
    document.getElementById('circ-more').hidden = hits.length <= state.shown;
  }

  function bind(id, key) {
    var el = document.getElementById(id);
    el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', function () {
      state[key] = el.value.trim();
      state.shown = PAGE;
      render();
    });
    return el;
  }

  function init(data) {
    docs = data;

    // popola select anni ed enti dai dati
    var years = {};
    var enti = {};
    docs.forEach(function (d) {
      if (d.anno) years[d.anno] = true;
      if (d.ente) enti[d.ente] = true;
    });

    var yearSel = document.getElementById('circ-f-anno');
    Object.keys(years).sort().reverse().forEach(function (y) {
      var o = document.createElement('option');
      o.value = y; o.textContent = y;
      yearSel.appendChild(o);
    });

    var enteSel = document.getElementById('circ-f-ente');
    Object.keys(enti).sort().forEach(function (e) {
      var o = document.createElement('option');
      o.value = e; o.textContent = e;
      enteSel.appendChild(o);
    });

    bind('circ-f-q', 'q');
    bind('circ-f-ente', 'ente');
    var permSel = bind('circ-f-permesso', 'permesso');
    bind('circ-f-anno', 'anno');

    // preselezione da URL (?permesso=slug)
    var m = window.location.search.match(/[?&]permesso=([^&]+)/);
    if (m) {
      var slug = decodeURIComponent(m[1]);
      if (permitNames[slug]) {
        permSel.value = slug;
        state.permesso = slug;
      }
    }

    document.getElementById('circ-more').addEventListener('click', function () {
      state.shown += PAGE;
      render();
    });

    document.getElementById('circ-loading').hidden = true;
    document.getElementById('circ-filters').hidden = false;
    render();
  }

  fetch('circolari-db.json')
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(init)
    .catch(function () {
      document.getElementById('circ-loading').textContent =
        'Errore nel caricamento della sezione circolari. Ricarica la pagina.';
    });
})();
