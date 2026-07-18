/* Banca dati giurisprudenza e circolari — ricerca e filtri client-side.
   Carica legale-db.json (generato in build da _data/legale.js) e filtra
   in memoria. Nessuna dipendenza esterna. */
(function () {
  'use strict';

  var mount = document.getElementById('leg-app');
  if (!mount) return;

  var PAGE = 50;
  var permitNames = {};
  try {
    permitNames = JSON.parse(document.getElementById('leg-permits-json').textContent);
  } catch (e) { /* select permessi resta vuota */ }

  var state = { q: '', tipo: '', permesso: '', anno: '', shown: PAGE };
  var docs = [];

  var ESITO = {
    ricorrente: { label: 'favorevole allo straniero', cls: 'leg-badge--esito-fav' },
    ministero: { label: 'favorevole alla PA', cls: 'leg-badge--esito-sfav' },
    questura: { label: 'favorevole alla PA', cls: 'leg-badge--esito-sfav' },
    commissione_territoriale: { label: 'favorevole alla PA', cls: 'leg-badge--esito-sfav' },
    misto: { label: 'esito misto', cls: 'leg-badge--esito-misto' },
    parzialmente_accolto: { label: 'esito misto', cls: 'leg-badge--esito-misto' },
  };

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
    if (state.tipo === 'giurisprudenza' && !d.giurisprudenza) return false;
    if (state.tipo === 'atti' && d.giurisprudenza) return false;
    if (state.anno && d.anno !== state.anno) return false;
    if (state.permesso) {
      var hit = false;
      for (var i = 0; i < d.permessi.length; i++) {
        if (d.permessi[i].slug === state.permesso) { hit = true; break; }
      }
      if (!hit) return false;
    }
    if (state.q) {
      var hay = (d.titolo + ' ' + (d.oggetto || '') + ' ' + (d.tema || '') + ' ' +
        (d.ente || '') + ' ' + (d.numero || '')).toLowerCase();
      var terms = state.q.toLowerCase().split(/\s+/);
      for (var t = 0; t < terms.length; t++) {
        if (terms[t] && hay.indexOf(terms[t]) === -1) return false;
      }
    }
    return true;
  }

  function itemHtml(d) {
    var badge = d.giurisprudenza
      ? '<span class="leg-badge leg-badge--sentenza">' + esc(d.tipo) + '</span>'
      : '<span class="leg-badge leg-badge--circolare">' + esc(d.tipo) + '</span>';
    var esito = d.esito && ESITO[d.esito]
      ? '<span class="leg-badge ' + ESITO[d.esito].cls + '">' + ESITO[d.esito].label + '</span>'
      : '';
    var meta = badge + esito;
    if (d.data) meta += '<span class="leg-item-date">' + fmtDate(d.data) + '</span>';
    if (d.ente && d.giurisprudenza === false) meta += '<span>' + esc(d.ente) + '</span>';

    var title = esc(d.titolo || '(senza titolo)');
    if (d.url) {
      title = '<a href="' + esc(d.url) + '" target="_blank" rel="noopener nofollow">' + title + '</a>';
    }

    var chips = '';
    for (var i = 0; i < d.permessi.length; i++) {
      var slug = d.permessi[i].slug;
      var name = permitNames[slug] || slug;
      chips += '<a class="leg-permit-chip" href="giurisprudenza-' + esc(slug) + '.html">' + esc(name) + '</a>';
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
    var countEl = document.getElementById('leg-count');
    countEl.textContent = hits.length === 1 ? '1 documento' : hits.length + ' documenti';

    var list = document.getElementById('leg-list');
    if (!hits.length) {
      list.innerHTML = '';
      document.getElementById('leg-empty').hidden = false;
      document.getElementById('leg-more').hidden = true;
      return;
    }
    document.getElementById('leg-empty').hidden = true;
    var shown = hits.slice(0, state.shown);
    var html = '';
    for (var i = 0; i < shown.length; i++) html += itemHtml(shown[i]);
    list.innerHTML = html;
    document.getElementById('leg-more').hidden = hits.length <= state.shown;
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

    // popola select anni dai dati
    var years = {};
    docs.forEach(function (d) { if (d.anno) years[d.anno] = true; });
    var yearSel = document.getElementById('leg-f-anno');
    Object.keys(years).sort().reverse().forEach(function (y) {
      var o = document.createElement('option');
      o.value = y; o.textContent = y;
      yearSel.appendChild(o);
    });

    bind('leg-f-q', 'q');
    bind('leg-f-tipo', 'tipo');
    var permSel = bind('leg-f-permesso', 'permesso');
    bind('leg-f-anno', 'anno');

    // preselezione da URL (?permesso=slug)
    var m = window.location.search.match(/[?&]permesso=([^&]+)/);
    if (m) {
      var slug = decodeURIComponent(m[1]);
      if (permitNames[slug]) {
        permSel.value = slug;
        state.permesso = slug;
      }
    }

    document.getElementById('leg-more').addEventListener('click', function () {
      state.shown += PAGE;
      render();
    });

    document.getElementById('leg-loading').hidden = true;
    document.getElementById('leg-filters').hidden = false;
    render();
  }

  fetch('legale-db.json')
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(init)
    .catch(function () {
      document.getElementById('leg-loading').textContent =
        'Errore nel caricamento della banca dati. Ricarica la pagina.';
    });
})();
