/* ===============================================
   SOS PERMESSO - CHATBOT WIDGET
   Floating assistant answering permit questions via
   /.netlify/functions/chat (Anthropic API proxy).
   Loaded only on Italian pages (see base.liquid).
   =============================================== */

(function () {
  'use strict';

  const ENDPOINT = '/.netlify/functions/chat';
  const STORAGE_KEY = 'sosp_chat_v1';
  const MAX_USER_TURNS = 10;
  const MAX_INPUT_CHARS = 1000;

  // UI strings per language — extend this dict (and the base.liquid condition)
  // to roll the widget out to other languages.
  const STRINGS = {
    it: {
      button: 'Fai una domanda',
      title: 'Assistente SOS Permesso',
      greeting:
        "Ciao! Sono l'assistente di SOS Permesso. Posso rispondere alle tue domande sui permessi di soggiorno in Italia. Come posso aiutarti?",
      disclaimer:
        'Risposte generate automaticamente: non sono una consulenza legale. Verifica sempre le informazioni importanti.',
      placeholder: 'Scrivi la tua domanda…',
      send: 'Invia',
      sending: 'Invio…',
      reset: 'Nuova conversazione',
      close: 'Chiudi',
      limitReached:
        'Hai raggiunto il limite di messaggi per questa conversazione. Premi "Nuova conversazione" per ricominciare.',
      connectionError: 'Errore di connessione. Controlla la rete e riprova.',
    },
  };

  const lang = (document.documentElement.lang || 'it').toLowerCase();
  const T = STRINGS[lang] || STRINGS.it;

  // Conversation state (persisted per browser tab)
  let messages = [];
  let busy = false;

  function loadState() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.messages)) messages = saved.messages;
    } catch (e) {
      messages = [];
    }
  }

  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages }));
    } catch (e) {
      /* storage full/unavailable — conversation just won't persist */
    }
  }

  function userTurns() {
    return messages.filter(function (m) {
      return m.role === 'user';
    }).length;
  }

  // ===============================================
  // MINIMAL MARKDOWN RENDERER
  // Supported (and enforced server-side via system prompt):
  // **bold**, "- " lists, [text](url) with url starting "/" or "https://"
  // ===============================================
  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderInline(escaped) {
    var out = escaped.replace(
      /\[([^\]]+)\]\((\/[^\s)]*|https:\/\/[^\s)]+)\)/g,
      function (m, label, url) {
        var external =
          url.indexOf('https://') === 0 && url.indexOf('https://www.sospermesso.it') !== 0;
        var attrs = external ? ' target="_blank" rel="noopener"' : '';
        return '<a href="' + url + '"' + attrs + '>' + label + '</a>';
      }
    );
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return out;
  }

  function renderMarkdown(text) {
    var lines = escapeHtml(text).split('\n');
    var html = '';
    var inList = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line.indexOf('- ') === 0) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += '<li>' + renderInline(line.slice(2)) + '</li>';
      } else {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        if (line !== '') html += '<p>' + renderInline(line) + '</p>';
      }
    }
    if (inList) html += '</ul>';
    return html;
  }

  // ===============================================
  // DOM INJECTION
  // ===============================================
  var els = {};

  function injectWidget() {
    var root = document.createElement('div');
    root.className = 'sosp-chat';
    root.innerHTML =
      '<button type="button" class="sosp-chat-fab" aria-expanded="false" aria-controls="sosp-chat-panel">' +
      '<span class="sosp-chat-fab-icon" aria-hidden="true">🤖</span>' +
      escapeHtml(T.button) +
      '</button>' +
      '<section class="sosp-chat-panel" id="sosp-chat-panel" role="dialog" aria-label="' +
      escapeHtml(T.title) +
      '" hidden>' +
      '<header class="sosp-chat-header">' +
      '<span class="sosp-chat-title">' +
      escapeHtml(T.title) +
      '</span>' +
      '<div class="sosp-chat-actions">' +
      '<button type="button" class="sosp-chat-reset">' +
      escapeHtml(T.reset) +
      '</button>' +
      '<button type="button" class="sosp-chat-close" aria-label="' +
      escapeHtml(T.close) +
      '">✕</button>' +
      '</div>' +
      '</header>' +
      '<div class="sosp-chat-messages" role="log" aria-live="polite"></div>' +
      '<form class="sosp-chat-form">' +
      '<textarea class="sosp-chat-input" rows="1" maxlength="' +
      MAX_INPUT_CHARS +
      '" placeholder="' +
      escapeHtml(T.placeholder) +
      '"></textarea>' +
      '<button type="submit" class="sosp-chat-send">' +
      escapeHtml(T.send) +
      '</button>' +
      '</form>' +
      '<p class="sosp-chat-note">' +
      escapeHtml(T.disclaimer) +
      '</p>' +
      '</section>';
    document.body.appendChild(root);

    els.root = root;
    els.fab = root.querySelector('.sosp-chat-fab');
    els.panel = root.querySelector('.sosp-chat-panel');
    els.messages = root.querySelector('.sosp-chat-messages');
    els.form = root.querySelector('.sosp-chat-form');
    els.input = root.querySelector('.sosp-chat-input');
    els.send = root.querySelector('.sosp-chat-send');
    els.reset = root.querySelector('.sosp-chat-reset');
    els.close = root.querySelector('.sosp-chat-close');

    els.fab.addEventListener('click', openPanel);
    els.close.addEventListener('click', closePanel);
    els.reset.addEventListener('click', resetConversation);
    els.form.addEventListener('submit', onSubmit);
    els.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        els.form.requestSubmit();
      }
    });
    els.input.addEventListener('input', autoGrow);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !els.panel.hidden) closePanel();
    });
  }

  function autoGrow() {
    els.input.style.height = 'auto';
    els.input.style.height = Math.min(els.input.scrollHeight, 120) + 'px';
  }

  function isMobile() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function openPanel() {
    els.panel.hidden = false;
    els.fab.setAttribute('aria-expanded', 'true');
    els.root.classList.add('sosp-chat-open');
    // Scroll lock via a class on <html>: app.js has a document-level click
    // handler that resets document.body.style.overflow, so body style is
    // unreliable here.
    if (isMobile()) document.documentElement.classList.add('sosp-chat-lock');
    renderAll();
    updateInputState();
    els.input.focus();
  }

  function closePanel() {
    els.panel.hidden = true;
    els.fab.setAttribute('aria-expanded', 'false');
    els.root.classList.remove('sosp-chat-open');
    document.documentElement.classList.remove('sosp-chat-lock');
    els.fab.focus();
  }

  function resetConversation() {
    messages = [];
    saveState();
    renderAll();
    updateInputState();
    els.input.focus();
  }

  // ===============================================
  // RENDERING
  // ===============================================
  function addBubble(role, html) {
    var bubble = document.createElement('div');
    bubble.className = 'sosp-chat-msg sosp-chat-msg-' + role;
    bubble.setAttribute('dir', 'auto');
    bubble.innerHTML = html;
    els.messages.appendChild(bubble);
    els.messages.scrollTop = els.messages.scrollHeight;
    return bubble;
  }

  function renderAll() {
    els.messages.innerHTML = '';
    addBubble('assistant', renderMarkdown(T.greeting));
    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      addBubble(m.role, m.role === 'user' ? '<p>' + escapeHtml(m.content) + '</p>' : renderMarkdown(m.content));
    }
  }

  function showTyping() {
    return addBubble(
      'assistant',
      '<span class="sosp-chat-dots"><span></span><span></span><span></span></span>'
    );
  }

  function updateInputState() {
    var limitReached = userTurns() >= MAX_USER_TURNS;
    els.input.disabled = busy || limitReached;
    els.send.disabled = busy || limitReached;
    els.send.textContent = busy ? T.sending : T.send;
    var existing = els.root.querySelector('.sosp-chat-limit');
    if (limitReached && !existing) {
      var note = document.createElement('p');
      note.className = 'sosp-chat-limit';
      note.textContent = T.limitReached;
      els.form.parentNode.insertBefore(note, els.form);
    } else if (!limitReached && existing) {
      existing.remove();
    }
  }

  // ===============================================
  // SEND FLOW
  // ===============================================
  function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    var text = els.input.value.trim();
    if (!text || text.length > MAX_INPUT_CHARS) return;
    if (userTurns() >= MAX_USER_TURNS) return;

    messages.push({ role: 'user', content: text });
    saveState();
    addBubble('user', '<p>' + escapeHtml(text) + '</p>');
    els.input.value = '';
    autoGrow();
    sendToServer(text);
  }

  function failSend(userText, errorMessage) {
    // Remove the failed user turn from state so roles keep alternating,
    // restore the input so the visitor can retry.
    messages.pop();
    saveState();
    addBubble('error', '<p>' + escapeHtml(errorMessage) + '</p>');
    els.input.value = userText;
    autoGrow();
  }

  async function sendToServer(userText) {
    busy = true;
    updateInputState();
    var typing = showTyping();

    try {
      var res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages, page: location.pathname }),
      });

      var contentType = res.headers.get('content-type') || '';

      if (!res.ok) {
        var errMsg = T.connectionError;
        try {
          var data = await res.json();
          if (data && data.error) errMsg = data.error;
        } catch (e) {
          /* non-JSON error body */
        }
        typing.remove();
        failSend(userText, errMsg);
        return;
      }

      if (contentType.indexOf('application/json') !== -1) {
        // Non-streaming fallback mode (server-side switch)
        var json = await res.json();
        typing.remove();
        var reply = (json && json.reply) || '';
        messages.push({ role: 'assistant', content: reply });
        saveState();
        addBubble('assistant', renderMarkdown(reply));
        return;
      }

      // Streamed plain-text response
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var full = '';
      var bubble = null;

      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        full += decoder.decode(chunk.value, { stream: true });
        if (!bubble) {
          typing.remove();
          bubble = addBubble('assistant', '');
        }
        bubble.innerHTML = renderMarkdown(full);
        els.messages.scrollTop = els.messages.scrollHeight;
      }
      full += decoder.decode();

      if (!bubble) {
        typing.remove();
        failSend(userText, T.connectionError);
        return;
      }
      bubble.innerHTML = renderMarkdown(full);
      messages.push({ role: 'assistant', content: full });
      saveState();
    } catch (err) {
      if (typing.parentNode) typing.remove();
      failSend(userText, T.connectionError);
    } finally {
      busy = false;
      updateInputState();
      if (!els.input.disabled) els.input.focus();
    }
  }

  // ===============================================
  // INIT
  // ===============================================
  function init() {
    loadState();
    injectWidget();
    updateInputState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
