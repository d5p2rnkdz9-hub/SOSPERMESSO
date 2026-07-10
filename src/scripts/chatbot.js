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

  // UI strings per language. Registers match the site's translations:
  // FR vous, ES tú, TR siz, RU вы, ZH 你, UR آپ, FA شما, BN আপনি.
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
    en: {
      button: 'Ask a question',
      title: 'SOS Permesso Assistant',
      greeting:
        "Hi! I'm the SOS Permesso assistant. I can answer your questions about residence permits in Italy. How can I help you?",
      disclaimer:
        'Answers are generated automatically: they are not legal advice. Always double-check important information.',
      placeholder: 'Write your question…',
      send: 'Send',
      sending: 'Sending…',
      reset: 'New conversation',
      close: 'Close',
      limitReached:
        'You have reached the message limit for this conversation. Press "New conversation" to start again.',
      connectionError: 'Connection error. Check your internet and try again.',
    },
    fr: {
      button: 'Poser une question',
      title: 'Assistant SOS Permesso',
      greeting:
        "Bonjour ! Je suis l'assistant de SOS Permesso. Je peux répondre à vos questions sur les permis de séjour en Italie. Comment puis-je vous aider ?",
      disclaimer:
        "Réponses générées automatiquement : ce n'est pas un conseil juridique. Vérifiez toujours les informations importantes.",
      placeholder: 'Écrivez votre question…',
      send: 'Envoyer',
      sending: 'Envoi…',
      reset: 'Nouvelle conversation',
      close: 'Fermer',
      limitReached:
        'Vous avez atteint la limite de messages pour cette conversation. Appuyez sur « Nouvelle conversation » pour recommencer.',
      connectionError: 'Erreur de connexion. Vérifiez votre réseau et réessayez.',
    },
    es: {
      button: 'Haz una pregunta',
      title: 'Asistente SOS Permesso',
      greeting:
        '¡Hola! Soy el asistente de SOS Permesso. Puedo responder a tus preguntas sobre los permisos de residencia en Italia. ¿Cómo puedo ayudarte?',
      disclaimer:
        'Respuestas generadas automáticamente: no son un consejo legal. Verifica siempre la información importante.',
      placeholder: 'Escribe tu pregunta…',
      send: 'Enviar',
      sending: 'Enviando…',
      reset: 'Nueva conversación',
      close: 'Cerrar',
      limitReached:
        'Has alcanzado el límite de mensajes de esta conversación. Pulsa "Nueva conversación" para empezar de nuevo.',
      connectionError: 'Error de conexión. Comprueba tu red e inténtalo de nuevo.',
    },
    tr: {
      button: 'Soru sorun',
      title: 'SOS Permesso Asistanı',
      greeting:
        "Merhaba! Ben SOS Permesso asistanıyım. İtalya'daki oturma izinleriyle ilgili sorularınızı yanıtlayabilirim. Size nasıl yardımcı olabilirim?",
      disclaimer:
        'Yanıtlar otomatik olarak oluşturulur: hukuki danışmanlık değildir. Önemli bilgileri her zaman kontrol edin.',
      placeholder: 'Sorunuzu yazın…',
      send: 'Gönder',
      sending: 'Gönderiliyor…',
      reset: 'Yeni konuşma',
      close: 'Kapat',
      limitReached:
        'Bu konuşma için mesaj sınırına ulaştınız. Yeniden başlamak için "Yeni konuşma"ya basın.',
      connectionError: 'Bağlantı hatası. İnternetinizi kontrol edip tekrar deneyin.',
    },
    bn: {
      button: 'প্রশ্ন করুন',
      title: 'SOS Permesso সহায়ক',
      greeting:
        'হ্যালো! আমি SOS Permesso-র সহায়ক। ইতালির বসবাসের অনুমতি (permesso di soggiorno) নিয়ে আপনার প্রশ্নের উত্তর দিতে পারি। আপনাকে কীভাবে সাহায্য করতে পারি?',
      disclaimer:
        'উত্তরগুলি স্বয়ংক্রিয়ভাবে তৈরি: এগুলি আইনি পরামর্শ নয়। গুরুত্বপূর্ণ তথ্য সবসময় যাচাই করুন।',
      placeholder: 'আপনার প্রশ্ন লিখুন…',
      send: 'পাঠান',
      sending: 'পাঠানো হচ্ছে…',
      reset: 'নতুন কথোপকথন',
      close: 'বন্ধ করুন',
      limitReached:
        'এই কথোপকথনের বার্তার সীমায় পৌঁছে গেছেন। আবার শুরু করতে "নতুন কথোপকথন" চাপুন।',
      connectionError: 'সংযোগে সমস্যা। ইন্টারনেট পরীক্ষা করে আবার চেষ্টা করুন।',
    },
    ru: {
      button: 'Задать вопрос',
      title: 'Ассистент SOS Permesso',
      greeting:
        'Здравствуйте! Я ассистент SOS Permesso. Могу ответить на ваши вопросы о видах на жительство в Италии. Чем могу помочь?',
      disclaimer:
        'Ответы создаются автоматически: это не юридическая консультация. Всегда проверяйте важную информацию.',
      placeholder: 'Напишите ваш вопрос…',
      send: 'Отправить',
      sending: 'Отправка…',
      reset: 'Новый разговор',
      close: 'Закрыть',
      limitReached:
        'Вы достигли лимита сообщений в этом разговоре. Нажмите «Новый разговор», чтобы начать заново.',
      connectionError: 'Ошибка соединения. Проверьте интернет и попробуйте ещё раз.',
    },
    ar: {
      button: 'اطرح سؤالاً',
      title: 'مساعد SOS Permesso',
      greeting:
        'مرحباً! أنا مساعد SOS Permesso. يمكنني الإجابة عن أسئلتك حول تصاريح الإقامة في إيطاليا. كيف يمكنني مساعدتك؟',
      disclaimer:
        'الإجابات مُنشأة تلقائياً: وهي ليست استشارة قانونية. تحقق دائماً من المعلومات المهمة.',
      placeholder: 'اكتب سؤالك…',
      send: 'إرسال',
      sending: 'جارٍ الإرسال…',
      reset: 'محادثة جديدة',
      close: 'إغلاق',
      limitReached:
        'لقد وصلت إلى الحد الأقصى للرسائل في هذه المحادثة. اضغط على "محادثة جديدة" للبدء من جديد.',
      connectionError: 'خطأ في الاتصال. تحقق من الإنترنت وحاول مرة أخرى.',
    },
    ur: {
      button: 'سوال پوچھیں',
      title: 'SOS Permesso اسسٹنٹ',
      greeting:
        'السلام علیکم! میں SOS Permesso کا اسسٹنٹ ہوں۔ اٹلی میں رہائشی اجازت ناموں (permesso di soggiorno) کے بارے میں آپ کے سوالات کا جواب دے سکتا ہوں۔ میں آپ کی کیا مدد کر سکتا ہوں؟',
      disclaimer:
        'جوابات خودکار طور پر تیار ہوتے ہیں: یہ قانونی مشورہ نہیں ہیں۔ اہم معلومات کی ہمیشہ تصدیق کریں۔',
      placeholder: 'اپنا سوال لکھیں…',
      send: 'بھیجیں',
      sending: 'بھیجا جا رہا ہے…',
      reset: 'نئی گفتگو',
      close: 'بند کریں',
      limitReached:
        'آپ اس گفتگو میں پیغامات کی حد تک پہنچ گئے ہیں۔ دوبارہ شروع کرنے کے لیے "نئی گفتگو" دبائیں۔',
      connectionError: 'کنکشن میں خرابی۔ انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔',
    },
    fa: {
      button: 'سؤال بپرسید',
      title: 'دستیار SOS Permesso',
      greeting:
        'سلام! من دستیار SOS Permesso هستم. می‌توانم به سؤالات شما درباره اجازه اقامت در ایتالیا پاسخ بدهم. چطور می‌توانم کمکتان کنم؟',
      disclaimer:
        'پاسخ‌ها به‌صورت خودکار تولید می‌شوند: مشاوره حقوقی نیستند. اطلاعات مهم را همیشه بررسی کنید.',
      placeholder: 'سؤال خود را بنویسید…',
      send: 'ارسال',
      sending: 'در حال ارسال…',
      reset: 'گفتگوی جدید',
      close: 'بستن',
      limitReached:
        'به حد مجاز پیام‌ها در این گفتگو رسیده‌اید. برای شروع دوباره «گفتگوی جدید» را بزنید.',
      connectionError: 'خطای اتصال. اینترنت را بررسی کنید و دوباره تلاش کنید.',
    },
    zh: {
      button: '提问',
      title: 'SOS Permesso 助手',
      greeting: '你好！我是 SOS Permesso 的助手，可以回答你关于意大利居留许可的问题。有什么可以帮你？',
      disclaimer: '回答由人工智能自动生成，不构成法律意见。重要信息请务必核实。',
      placeholder: '请输入你的问题…',
      send: '发送',
      sending: '发送中…',
      reset: '新对话',
      close: '关闭',
      limitReached: '本次对话已达到消息数量上限。请点击"新对话"重新开始。',
      connectionError: '连接出错。请检查网络后重试。',
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
