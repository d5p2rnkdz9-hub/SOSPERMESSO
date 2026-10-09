// Testi della home (design system «Adesivo», ott 2026).
// Struttura condivisa: _includes/components/home.liquid, stili in src/styles/home.css.
// IT è la fonte. Le altre lingue riusano le frasi già tradotte della vecchia home;
// le chiavi nuove (findTitle, guidesTitle, final.title, more.*, chip «Pratiche», cta di
// kit postale e controlla permesso) sono una BOZZA da far rivedere a madrelingua (_bozza).
// Una chiave mancante ricade sull'italiano nel template.
// catItems: [slug, etichetta breve]; nelle altre lingue l'etichetta è il nome del
// permesso dai dati Notion della lingua, senza la parte tra parentesi.
module.exports = {
  "it": {
    "hideLinks": true,
    "hideFinal": true,
    "badge": "41+ permessi · aggiornato al 9 ottobre 2026",
    "lead": "La tua guida ai permessi di soggiorno.",
    "stamp": "Facile",
    "sub": "Completa e aggiornata. Rispondi a poche domande e scopri cosa puoi fare.",
    "heroAlt": "Persone che consultano documenti sui permessi di soggiorno",
    "test": {
      "noEyebrow": "Non ho un permesso",
      "noQ": "Posso averlo?",
      "haveEyebrow": "Ho già un permesso",
      "haveQ": "Posso rinnovarlo o convertirlo?"
    },
    "findTitle": "Trova il tuo permesso",
    "seeAll": "Vedi tutti →",
    "cats": {
      "work": "Studio / Lavoro",
      "protection": "Protezione",
      "health": "Cure mediche",
      "family": "Motivi familiari"
    },
    "catItems": {
      "work": [
        [
          "lavoro-subordinato-dopo-ingresso-con-visto-per-flussi",
          "Lavoro subordinato"
        ],
        [
          "lavoro-autonomo-dopo-ingresso-con-visto-per-flussi",
          "Lavoro autonomo"
        ],
        [
          "studio-dopo-ingresso-con-visto",
          "Studio"
        ],
        [
          "attesa-occupazione",
          "Attesa occupazione"
        ]
      ],
      "protection": [
        [
          "richiesta-asilo",
          "Richiesta asilo"
        ],
        [
          "asilo-status-rifugiato",
          "Status di rifugiato"
        ],
        [
          "protezione-sussidiaria",
          "Protezione sussidiaria"
        ],
        [
          "protezione-speciale",
          "Protezione speciale"
        ]
      ],
      "health": [
        [
          "cure-mediche-donna-in-stato-di-gravidanza-o-con-figlio-minore-di-6-mesi",
          "Gravidanza"
        ],
        [
          "cure-mediche-dopo-ingresso-con-visto-per-cure-mediche",
          "Cure mediche"
        ],
        [
          "cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia",
          "Gravi motivi di salute"
        ]
      ],
      "family": [
        [
          "famiglia-dopo-ingresso-con-visto-per-ricongiungimento-familiare",
          "Ricongiungimento familiare"
        ],
        [
          "famiglia-senza-nullaosta-per-ricongiungimento-coesione-familiare",
          "Coesione familiare"
        ],
        [
          "famiglia-genitore-di-cittadino-italiano",
          "Genitore di cittadino italiano"
        ],
        [
          "carta-di-soggiorno-per-familiari-di-cittadini-ue",
          "Carta di soggiorno familiare UE"
        ]
      ]
    },
    "guidesTitle": "Guide passo passo",
    "soon": "In arrivo",
    "guides": [
      {
        "tag": "Protezione",
        "color": "protection",
        "q": "Ho diritto alla protezione internazionale?",
        "cta": "Guida all'asilo in Italia",
        "href": "protezione-internazionale.html"
      },
      {
        "tag": "Famiglia",
        "color": "family",
        "q": "Posso portare qui la mia famiglia?",
        "cta": "Ricongiungimento familiare",
        "href": "ricongiungimento-familiare.html"
      },
      {
        "tag": "Lavoro",
        "color": "work",
        "q": "Posso lavorare in Italia?",
        "cta": "Guida al lavoro in Italia",
        "href": "lavorare-in-italia.html"
      },
      {
        "tag": "Lavoro",
        "color": "work",
        "q": "Posso entrare con il decreto flussi?",
        "cta": "Come funziona",
        "href": "decreto-flussi.html",
        "soon": true
      },
      {
        "tag": "Pratiche",
        "color": "yellow",
        "q": "Che documenti porto in Questura?",
        "cta": "Checklist per ogni permesso",
        "href": "documenti-questura.html",
        "hide": true
      },
      {
        "tag": "Pratiche",
        "color": "yellow",
        "q": "Come compilo il kit postale?",
        "cta": "Moduli passo passo",
        "href": "kit-postale.html",
        "hide": true
      },
      {
        "tag": "Pratiche",
        "color": "yellow",
        "q": "Quanto costa il mio permesso?",
        "cta": "Bollettini e marche da bollo",
        "href": "database.html?go=costi",
        "hide": true
      },
      {
        "tag": "Pratiche",
        "color": "yellow",
        "q": "Il mio permesso è pronto?",
        "cta": "Controlla lo stato",
        "href": "controlla-permesso.html",
        "hide": true
      }
    ],
    "legal": {
      "title": "Aiuto legale gratis",
      "desc": "Sportelli e associazioni gratuite nella tua città →"
    },
    "dict": {
      "title": "Dizionario",
      "desc": "Le parole difficili della burocrazia, spiegate semplici →"
    },
    "more": {
      "label": "Per approfondire:",
      "circolari": "Circolari",
      "normativa": "Normativa coordinata",
      "patto": "Patto UE",
      "nuovo": "Nuovo"
    },
    "final": {
      "title": "Non sai da dove partire?",
      "sub": "Rispondi a poche domande: ti diciamo noi cosa puoi fare.",
      "noTitle": "Non ho ancora un permesso",
      "noAction": "Aiutami a capire se posso averlo →",
      "haveTitle": "Ho già un permesso",
      "haveAction": "Posso rinnovarlo o convertirlo? →"
    }
  },
  "en": {
    "badge": "41+ Permits · Updated 9 October 2026",
    "lead": "Your Guide to Residence Permits.",
    "stamp": "Easy",
    "sub": "Complete. Up to date. Answer a few questions and find out what you can do.",
    "heroAlt": "People consulting documents about residence permits",
    "test": {
      "noEyebrow": "I don't have a permit",
      "noQ": "Can I get one?",
      "haveEyebrow": "I already have a permit",
      "haveQ": "Can I renew or convert it?"
    },
    "seeAll": "All permits (database) →",
    "cats": {
      "work": "Study / Work",
      "protection": "Protection",
      "health": "Medical Care",
      "family": "Family"
    },
    "soon": "Coming soon",
    "guides": [
      {
        "tag": "Protection",
        "color": "protection",
        "q": "International protection",
        "cta": "How to apply for asylum in Italy and how the procedure works",
        "href": "protezione-internazionale.html"
      },
      {
        "tag": "Family",
        "color": "family",
        "q": "Can I bring my family here?",
        "cta": "Guide to family reunification in Italy",
        "href": "ricongiungimento-familiare.html"
      },
      {
        "tag": "Study / Work",
        "color": "work",
        "q": "Decreto flussi",
        "cta": "How entry for work purposes works",
        "href": "decreto-flussi.html",
        "soon": true
      },
      {
        "color": "yellow",
        "q": "What documents do I need?",
        "cta": "Find out which documents to bring to the Questura for your permit",
        "href": "database.html?go=documenti",
        "tag": "Practical"
      },
      {
        "color": "yellow",
        "q": "Postal kit and other forms",
        "href": "kit-postale.html",
        "tag": "Practical",
        "cta": "Forms step by step"
      },
      {
        "color": "yellow",
        "q": "How much does the permit cost?",
        "cta": "Postal orders, revenue stamps and costs for each type of permit",
        "href": "database.html?go=costi",
        "tag": "Practical"
      },
      {
        "color": "yellow",
        "q": "Check if your residence permit is ready",
        "href": "controlla-permesso.html",
        "tag": "Practical",
        "cta": "Check the status"
      }
    ],
    "legal": {
      "title": "Free legal aid",
      "desc": "Offices and organisations offering free legal assistance near you →"
    },
    "dict": {
      "title": "Dictionary",
      "desc": "Bureaucratic terms explained in simple language →"
    },
    "more": {
      "patto": "Patto UE",
      "label": "Learn more:",
      "circolari": "Circulars",
      "normativa": "Consolidated legislation",
      "nuovo": "New"
    },
    "final": {
      "sub": "Answer a few questions and find out what you can do.",
      "noTitle": "I don't have a permit",
      "noAction": "Can I get one? →",
      "haveTitle": "I already have a permit",
      "haveAction": "Can I renew or convert it? →",
      "title": "Not sure where to start?"
    },
    "findTitle": "Find your permit",
    "guidesTitle": "Step-by-step guides",
    "_bozza": "Traduzioni di findTitle, guidesTitle, final.title, more.*, chip «Pratiche» e cta kit/controlla: BOZZA (ott 2026) da far rivedere a madrelingua."
  },
  "fr": {
    "badge": "41+ Permis · Mis à jour le 9 octobre 2026",
    "lead": "Votre Guide aux Permis de Séjour.",
    "stamp": "Facile",
    "sub": "Complet. À jour. Réponds à quelques questions et découvre ce que tu peux faire.",
    "heroAlt": "Personnes consultant des documents sur les permis de séjour",
    "test": {
      "noEyebrow": "Je n'ai pas de permis",
      "noQ": "Puis-je en obtenir un ?",
      "haveEyebrow": "J'ai déjà un permis",
      "haveQ": "Puis-je le renouveler ou le convertir ?"
    },
    "seeAll": "Tous les permis (base de données) →",
    "cats": {
      "work": "Études / Travail",
      "protection": "Protection",
      "health": "Soins médicaux",
      "family": "Famille"
    },
    "soon": "Bientôt",
    "guides": [
      {
        "tag": "Protection",
        "color": "protection",
        "q": "Protection internationale",
        "cta": "Comment demander l'asile en Italie et comment fonctionne la procédure",
        "href": "protezione-internazionale.html"
      },
      {
        "tag": "Famille",
        "color": "family",
        "q": "Puis-je amener ma famille ici ?",
        "cta": "Guide au regroupement familial en Italie",
        "href": "ricongiungimento-familiare.html"
      },
      {
        "tag": "Études / Travail",
        "color": "work",
        "q": "Decreto flussi",
        "cta": "Comment fonctionne l'entrée pour travail",
        "href": "decreto-flussi.html",
        "soon": true
      },
      {
        "color": "yellow",
        "q": "Quels documents me faut-il ?",
        "cta": "Découvrez quels documents apporter à la Questura pour votre permis",
        "href": "database.html?go=documenti",
        "tag": "Démarches"
      },
      {
        "color": "yellow",
        "q": "Kit postal et autres formulaires",
        "href": "kit-postale.html",
        "tag": "Démarches",
        "cta": "Formulaires pas à pas"
      },
      {
        "color": "yellow",
        "q": "Combien coûte le permis ?",
        "cta": "Bulletins, timbres fiscaux et coûts pour chaque type de permis",
        "href": "database.html?go=costi",
        "tag": "Démarches"
      },
      {
        "color": "yellow",
        "q": "Vérifier si votre titre de séjour est prêt",
        "href": "controlla-permesso.html",
        "tag": "Démarches",
        "cta": "Vérifier l'état"
      }
    ],
    "legal": {
      "title": "Aide juridique gratuite",
      "desc": "Bureaux et associations offrant une aide juridique gratuite près de chez vous →"
    },
    "dict": {
      "title": "Dictionnaire",
      "desc": "Termes bureaucratiques expliqués simplement →"
    },
    "more": {
      "patto": "Patto UE",
      "label": "Pour en savoir plus :",
      "circolari": "Circulaires",
      "normativa": "Textes de loi consolidés",
      "nuovo": "Nouveau"
    },
    "final": {
      "sub": "Réponds à quelques questions et découvre ce que tu peux faire.",
      "noTitle": "Je n'ai pas de permis",
      "noAction": "Puis-je en obtenir un ? →",
      "haveTitle": "J'ai déjà un permis",
      "haveAction": "Puis-je le renouveler ou le convertir ? →",
      "title": "Vous ne savez pas par où commencer ?"
    },
    "findTitle": "Trouvez votre permis",
    "guidesTitle": "Guides pas à pas",
    "_bozza": "Traduzioni di findTitle, guidesTitle, final.title, more.*, chip «Pratiche» e cta kit/controlla: BOZZA (ott 2026) da far rivedere a madrelingua."
  },
  "es": {
    "badge": "41+ Permisos · Actualizado el 9 de octubre de 2026",
    "lead": "Tu Guía a los Permisos de Residencia.",
    "stamp": "Fácil",
    "sub": "Completa. Actualizada. Responde a pocas preguntas y descubre qué puedes hacer.",
    "heroAlt": "Personas consultando documentos sobre permisos de residencia",
    "test": {
      "noEyebrow": "No tengo permiso",
      "noQ": "¿Puedo obtenerlo?",
      "haveEyebrow": "Ya tengo un permiso",
      "haveQ": "¿Puedo renovarlo o convertirlo?"
    },
    "seeAll": "Todos los permisos (base de datos) →",
    "cats": {
      "work": "Estudio / Trabajo",
      "protection": "Proteccion",
      "health": "Tratamiento medico",
      "family": "Familia"
    },
    "soon": "Próximamente",
    "guides": [
      {
        "tag": "Proteccion",
        "color": "protection",
        "q": "Protección internacional",
        "cta": "Cómo solicitar asilo en Italia y cómo funciona el procedimiento",
        "href": "protezione-internazionale.html"
      },
      {
        "tag": "Familia",
        "color": "family",
        "q": "¿Puedo traer a mi familia?",
        "cta": "Guía a la reunificación familiar en Italia",
        "href": "ricongiungimento-familiare.html"
      },
      {
        "tag": "Estudio / Trabajo",
        "color": "work",
        "q": "Decreto flussi",
        "cta": "Cómo funciona la entrada por trabajo",
        "href": "decreto-flussi.html",
        "soon": true
      },
      {
        "color": "yellow",
        "q": "¿Qué documentos necesito?",
        "cta": "Descubre qué documentos llevar a la Questura para tu permiso",
        "href": "database.html?go=documenti",
        "tag": "Trámites"
      },
      {
        "color": "yellow",
        "q": "Kit postal y otros formularios",
        "href": "kit-postale.html",
        "tag": "Trámites",
        "cta": "Formularios paso a paso"
      },
      {
        "color": "yellow",
        "q": "¿Cuánto cuesta el permiso?",
        "cta": "Boletines, sellos fiscales y costos para cada tipo de permiso",
        "href": "database.html?go=costi",
        "tag": "Trámites"
      },
      {
        "color": "yellow",
        "q": "Verifica si tu permesso di soggiorno esta listo",
        "href": "controlla-permesso.html",
        "tag": "Trámites",
        "cta": "Consulta el estado"
      }
    ],
    "legal": {
      "title": "Asistencia legal gratis",
      "desc": "Oficinas y asociaciones con asistencia legal gratuita cerca de ti →"
    },
    "dict": {
      "title": "Diccionario",
      "desc": "Términos burocráticos explicados de forma sencilla →"
    },
    "more": {
      "patto": "Patto UE",
      "label": "Para saber más:",
      "circolari": "Circulares",
      "normativa": "Normativa consolidada",
      "nuovo": "Nuevo"
    },
    "final": {
      "sub": "Responde a pocas preguntas y descubre qué puedes hacer.",
      "noTitle": "No tengo permiso",
      "noAction": "¿Puedo obtenerlo? →",
      "haveTitle": "Ya tengo un permiso",
      "haveAction": "¿Puedo renovarlo o convertirlo? →",
      "title": "¿No sabes por dónde empezar?"
    },
    "findTitle": "Encuentra tu permiso",
    "guidesTitle": "Guías paso a paso",
    "_bozza": "Traduzioni di findTitle, guidesTitle, final.title, more.*, chip «Pratiche» e cta kit/controlla: BOZZA (ott 2026) da far rivedere a madrelingua."
  },
  "tr": {
    "badge": "41+ İzin · 9 Ekim 2026 itibarıyla güncel",
    "lead": "Oturma İzinleri Rehberiniz.",
    "stamp": "Kolay",
    "sub": "Kapsamlı. Güncel. Birkaç soruya cevap ver, ne yapabileceğini öğren.",
    "heroAlt": "Oturma izni belgeleri hakkında bilgi alan kişiler",
    "test": {
      "noEyebrow": "İznim yok",
      "noQ": "Alabilir miyim?",
      "haveEyebrow": "Zaten iznim var",
      "haveQ": "Yenileyebilir veya dönüştürebilir miyim?"
    },
    "seeAll": "Tüm izinler (veri tabanı) →",
    "cats": {
      "work": "Egitim / Calisma",
      "protection": "Koruma",
      "health": "Tibbi Tedavi",
      "family": "Aile"
    },
    "soon": "Yakında",
    "guides": [
      {
        "tag": "Koruma",
        "color": "protection",
        "q": "Uluslararası koruma",
        "cta": "İtalya'da nasıl iltica başvurusu yapılır ve prosedür nasıl işler",
        "href": "protezione-internazionale.html"
      },
      {
        "tag": "Aile",
        "color": "family",
        "q": "Ailemi buraya getirebilir miyim?",
        "cta": "İtalya'da aile birleşimi rehberi",
        "href": "ricongiungimento-familiare.html"
      },
      {
        "tag": "Egitim / Calisma",
        "color": "work",
        "q": "Decreto flussi",
        "cta": "İş amaçlı giriş nasıl işler",
        "href": "decreto-flussi.html",
        "soon": true
      },
      {
        "color": "yellow",
        "q": "Hangi belgeler gerekli?",
        "cta": "İzniniz için Questura'ya hangi belgeleri götüreceğinizi öğrenin",
        "href": "database.html?go=documenti",
        "tag": "İşlemler"
      },
      {
        "color": "yellow",
        "q": "Kit postale ve diğer formlar",
        "href": "kit-postale.html",
        "tag": "İşlemler",
        "cta": "Adım adım formlar"
      },
      {
        "color": "yellow",
        "q": "İzin ne kadar?",
        "cta": "Her izin türü için posta havaleleri, damga pulları ve maliyetler",
        "href": "database.html?go=costi",
        "tag": "İşlemler"
      },
      {
        "color": "yellow",
        "q": "Oturma izninizin hazır olup olmadığını kontrol edin",
        "href": "controlla-permesso.html",
        "tag": "İşlemler",
        "cta": "Durumu kontrol edin"
      }
    ],
    "legal": {
      "title": "Ücretsiz hukuki yardım",
      "desc": "Yakınınızda ücretsiz hukuki yardım sunan ofisler ve kuruluşlar →"
    },
    "dict": {
      "title": "Sözlük",
      "desc": "Bürokratik terimler basit bir dille açıklandı →"
    },
    "more": {
      "patto": "Patto UE",
      "label": "Daha fazla bilgi:",
      "circolari": "Genelgeler",
      "normativa": "Birleştirilmiş mevzuat",
      "nuovo": "Yeni"
    },
    "final": {
      "sub": "Birkaç soruya cevap ver, ne yapabileceğini öğren.",
      "noTitle": "İznim yok",
      "noAction": "Alabilir miyim? →",
      "haveTitle": "Zaten iznim var",
      "haveAction": "Yenileyebilir veya dönüştürebilir miyim? →",
      "title": "Nereden başlayacağınızı bilmiyor musunuz?"
    },
    "findTitle": "İzninizi bulun",
    "guidesTitle": "Adım adım rehberler",
    "_bozza": "Traduzioni di findTitle, guidesTitle, final.title, more.*, chip «Pratiche» e cta kit/controlla: BOZZA (ott 2026) da far rivedere a madrelingua."
  },
  "ru": {
    "badge": "41+ Разрешений · Обновлено 9 октября 2026",
    "lead": "Ваш Гид по Видам на Жительство.",
    "stamp": "Просто",
    "sub": "Полно. Актуально. Ответьте на несколько вопросов и узнайте, что вы можете сделать.",
    "heroAlt": "Люди, изучающие документы о видах на жительство",
    "test": {
      "noEyebrow": "У меня нет разрешения",
      "noQ": "Могу ли я его получить?",
      "haveEyebrow": "У меня уже есть разрешение",
      "haveQ": "Могу ли я продлить или конвертировать его?"
    },
    "seeAll": "Все разрешения (база данных) →",
    "cats": {
      "work": "Работа / Учёба",
      "protection": "Защита",
      "health": "Медицина",
      "family": "Семья"
    },
    "soon": "Скоро",
    "guides": [
      {
        "tag": "Защита",
        "color": "protection",
        "q": "Международная защита",
        "cta": "Как подать заявление на убежище в Италии и как работает процедура",
        "href": "protezione-internazionale.html"
      },
      {
        "tag": "Семья",
        "color": "family",
        "q": "Могу ли я привезти семью?",
        "cta": "Руководство по воссоединению семьи в Италии",
        "href": "ricongiungimento-familiare.html"
      },
      {
        "tag": "Работа / Учёба",
        "color": "work",
        "q": "Decreto flussi",
        "cta": "Как работает въезд для трудоустройства",
        "href": "decreto-flussi.html",
        "soon": true
      },
      {
        "color": "yellow",
        "q": "Какие документы нужны?",
        "cta": "Узнайте, какие документы принести в Квестуру для вашего разрешения",
        "href": "database.html?go=documenti",
        "tag": "Процедуры"
      },
      {
        "color": "yellow",
        "q": "Почтовый комплект и другие формы",
        "href": "kit-postale.html",
        "tag": "Процедуры",
        "cta": "Формы шаг за шагом"
      },
      {
        "color": "yellow",
        "q": "Сколько стоит разрешение?",
        "cta": "Почтовые переводы, гербовые марки и стоимость для каждого типа разрешения",
        "href": "database.html?go=costi",
        "tag": "Процедуры"
      },
      {
        "color": "yellow",
        "q": "Проверьте, готово ли ваше разрешение на проживание",
        "href": "controlla-permesso.html",
        "tag": "Процедуры",
        "cta": "Проверьте статус"
      }
    ],
    "legal": {
      "title": "Бесплатная юридическая помощь",
      "desc": "Офисы и организации, предлагающие бесплатную юридическую помощь рядом с вами →"
    },
    "dict": {
      "title": "Словарь",
      "desc": "Бюрократические термины, объяснённые простым языком →"
    },
    "more": {
      "patto": "Patto UE",
      "label": "Подробнее:",
      "circolari": "Циркуляры",
      "normativa": "Сводное законодательство",
      "nuovo": "Новое"
    },
    "final": {
      "sub": "Ответьте на несколько вопросов и узнайте, что вы можете сделать.",
      "noTitle": "У меня нет разрешения",
      "noAction": "Могу ли я его получить? →",
      "haveTitle": "У меня уже есть разрешение",
      "haveAction": "Могу ли я продлить или конвертировать его? →",
      "title": "Не знаете, с чего начать?"
    },
    "findTitle": "Найдите своё разрешение",
    "guidesTitle": "Пошаговые руководства",
    "_bozza": "Traduzioni di findTitle, guidesTitle, final.title, more.*, chip «Pratiche» e cta kit/controlla: BOZZA (ott 2026) da far rivedere a madrelingua."
  },
  "bn": {
    "badge": "৪১+ অনুমতি · ৯ অক্টোবর ২০২৬ আপডেটেড",
    "lead": "বসবাসের অনুমতির আপনার গাইড।",
    "stamp": "সহজ",
    "sub": "সম্পূর্ণ। আপডেটেড। কয়েকটি প্রশ্নের উত্তর দিন এবং জানুন আপনি কী করতে পারেন।",
    "heroAlt": "বসবাসের অনুমতির নথি দেখছেন মানুষজন",
    "test": {
      "noEyebrow": "আমার অনুমতি নেই",
      "noQ": "আমি কি পেতে পারি?",
      "haveEyebrow": "আমার ইতিমধ্যে অনুমতি আছে",
      "haveQ": "আমি কি নবায়ন বা রূপান্তর করতে পারি?"
    },
    "seeAll": "সব অনুমতি (ডেটাবেস) →",
    "cats": {
      "work": "পড়াশোনা / কাজ",
      "protection": "সুরক্ষা",
      "health": "চিকিৎসা",
      "family": "পরিবার"
    },
    "soon": "শীঘ্রই আসছে",
    "guides": [
      {
        "tag": "সুরক্ষা",
        "color": "protection",
        "q": "আন্তর্জাতিক সুরক্ষা",
        "cta": "ইতালিতে আশ্রয়ের আবেদন কীভাবে করবেন এবং প্রক্রিয়া কীভাবে কাজ করে",
        "href": "protezione-internazionale.html"
      },
      {
        "tag": "পরিবার",
        "color": "family",
        "q": "আমি কি পরিবার আনতে পারি?",
        "cta": "ইতালিতে পারিবারিক পুনর্মিলনের গাইড",
        "href": "ricongiungimento-familiare.html"
      },
      {
        "tag": "পড়াশোনা / কাজ",
        "color": "work",
        "q": "Decreto flussi",
        "cta": "কাজের উদ্দেশ্যে প্রবেশ কীভাবে কাজ করে",
        "href": "decreto-flussi.html",
        "soon": true
      },
      {
        "color": "yellow",
        "q": "কোন নথিপত্র প্রয়োজন?",
        "cta": "আপনার অনুমতির জন্য Questura-তে কোন নথি নিয়ে যেতে হবে জানুন",
        "href": "database.html?go=documenti",
        "tag": "প্রক্রিয়া"
      },
      {
        "color": "yellow",
        "q": "কিট পোস্তালে ও অন্যান্য ফর্ম",
        "href": "kit-postale.html",
        "tag": "প্রক্রিয়া",
        "cta": "ধাপে ধাপে ফর্ম"
      },
      {
        "color": "yellow",
        "q": "অনুমতির খরচ কত?",
        "cta": "প্রতিটি ধরনের অনুমতির জন্য পোস্টাল অর্ডার, রাজস্ব স্ট্যাম্প ও খরচ",
        "href": "database.html?go=costi",
        "tag": "প্রক্রিয়া"
      },
      {
        "color": "yellow",
        "q": "আপনার বসবাসের অনুমতি তৈরি হয়েছে কিনা পরীক্ষা করুন",
        "href": "controlla-permesso.html",
        "tag": "প্রক্রিয়া",
        "cta": "অবস্থা দেখুন"
      }
    ],
    "legal": {
      "title": "বিনামূল্যে আইনি সহায়তা",
      "desc": "আপনার কাছাকাছি বিনামূল্যে আইনি সহায়তা প্রদানকারী অফিস ও সংস্থা →"
    },
    "dict": {
      "title": "অভিধান",
      "desc": "আমলাতান্ত্রিক পরিভাষা সহজ ভাষায় ব্যাখ্যা করা হয়েছে →"
    },
    "more": {
      "patto": "Patto UE",
      "label": "আরও জানুন:",
      "circolari": "সার্কুলার",
      "normativa": "সমন্বিত আইন",
      "nuovo": "নতুন"
    },
    "final": {
      "sub": "কয়েকটি প্রশ্নের উত্তর দিন এবং জানুন আপনি কী করতে পারেন।",
      "noTitle": "আমার অনুমতি নেই",
      "noAction": "আমি কি পেতে পারি? →",
      "haveTitle": "আমার ইতিমধ্যে অনুমতি আছে",
      "haveAction": "আমি কি নবায়ন বা রূপান্তর করতে পারি? →",
      "title": "কোথা থেকে শুরু করবেন বুঝতে পারছেন না?"
    },
    "findTitle": "আপনার অনুমতি খুঁজুন",
    "guidesTitle": "ধাপে ধাপে গাইড",
    "_bozza": "Traduzioni di findTitle, guidesTitle, final.title, more.*, chip «Pratiche» e cta kit/controlla: BOZZA (ott 2026) da far rivedere a madrelingua."
  },
  "ar": {
    "badge": "41+ تصريح · محدّث في 9 أكتوبر 2026",
    "lead": "دليلك الشامل لتصاريح الإقامة.",
    "stamp": "سهل الاستخدام",
    "sub": "شامل ومحدّث. أجب عن بعض الأسئلة واكتشف ما يمكنك فعله.",
    "heroAlt": "أشخاص يبحثون عن معلومات عن وثائق تصريح الإقامة",
    "test": {
      "noEyebrow": "ليس لدي تصريح",
      "noQ": "هل يمكنني الحصول عليه؟",
      "haveEyebrow": "لدي تصريح بالفعل",
      "haveQ": "هل يمكنني تجديده أو تحويله؟"
    },
    "seeAll": "جميع التصاريح (قاعدة البيانات) ←",
    "cats": {
      "work": "الدراسة / العمل",
      "protection": "الحماية",
      "health": "العلاج الطبي",
      "family": "الأسرة"
    },
    "soon": "قريباً",
    "guides": [
      {
        "tag": "الحماية",
        "color": "protection",
        "q": "الحماية الدولية",
        "cta": "كيفية تقديم طلب اللجوء في إيطاليا وكيف تسير الإجراءات",
        "href": "protezione-internazionale.html"
      },
      {
        "tag": "الأسرة",
        "color": "family",
        "q": "هل يمكنني إحضار عائلتي؟",
        "cta": "دليل لم الشمل العائلي في إيطاليا",
        "href": "ricongiungimento-familiare.html"
      },
      {
        "tag": "الدراسة / العمل",
        "color": "work",
        "q": "نظام تدفقات العمالة (Decreto Flussi)",
        "cta": "كيف يعمل نظام الدخول للعمل",
        "href": "decreto-flussi.html",
        "soon": true
      },
      {
        "color": "yellow",
        "q": "ما هي الوثائق المطلوبة؟",
        "cta": "اكتشف الوثائق التي يجب تقديمها في مصلحة الشرطة (Questura) لتصريحك",
        "href": "database.html?go=documenti",
        "tag": "إجراءات"
      },
      {
        "color": "yellow",
        "q": "طلب البريد (Kit Postale) ونماذج أخرى",
        "href": "kit-postale.html",
        "tag": "إجراءات",
        "cta": "النماذج خطوة بخطوة"
      },
      {
        "color": "yellow",
        "q": "كم يكلف التصريح؟",
        "cta": "الحوالات البريدية والطوابع والتكاليف لكل نوع من التصاريح",
        "href": "database.html?go=costi",
        "tag": "إجراءات"
      },
      {
        "color": "yellow",
        "q": "تحقق مما إذا كان تصريح إقامتك جاهزا",
        "href": "controlla-permesso.html",
        "tag": "إجراءات",
        "cta": "تحقق من الحالة"
      }
    ],
    "legal": {
      "title": "مساعدة قانونية مجانية",
      "desc": "مراكز تقدم مساعدة قانونية مجانية بالقرب منك →"
    },
    "dict": {
      "title": "القاموس",
      "desc": "شرح المصطلحات البيروقراطية بلغة بسيطة →"
    },
    "more": {
      "patto": "Patto UE",
      "label": "للمزيد:",
      "circolari": "التعاميم",
      "normativa": "النصوص القانونية الموحّدة",
      "nuovo": "جديد"
    },
    "final": {
      "sub": "أجب عن بعض الأسئلة واكتشف ما يمكنك فعله.",
      "noTitle": "ليس لدي تصريح",
      "noAction": "هل يمكنني الحصول عليه؟ →",
      "haveTitle": "لدي تصريح بالفعل",
      "haveAction": "هل يمكنني تجديده أو تحويله؟ →",
      "title": "لا تعرف من أين تبدأ؟"
    },
    "findTitle": "ابحث عن تصريحك",
    "guidesTitle": "أدلة خطوة بخطوة",
    "_bozza": "Traduzioni di findTitle, guidesTitle, final.title, more.*, chip «Pratiche» e cta kit/controlla: BOZZA (ott 2026) da far rivedere a madrelingua."
  },
  "ur": {
    "badge": "41+ اجازت نامے · 9 اکتوبر 2026 تک تازہ کاری",
    "lead": "اقامتی اجازت ناموں کی رہنمائی۔",
    "stamp": "آسان",
    "sub": "مکمل۔ تازہ ترین۔ چند سوالات کے جواب دیں اور جانیں کہ آپ کیا کر سکتے ہیں۔",
    "heroAlt": "لوگ اقامتی اجازت ناموں کی دستاویزات کے بارے میں معلومات حاصل کر رہے ہیں",
    "test": {
      "noEyebrow": "میرے پاس اجازت نامہ نہیں ہے",
      "noQ": "کیا مجھے مل سکتا ہے؟",
      "haveEyebrow": "میرے پاس پہلے سے اجازت نامہ ہے",
      "haveQ": "کیا میں اس کی تجدید یا تبدیلی کر سکتا ہوں؟"
    },
    "seeAll": "تمام اجازت نامے (ڈیٹابیس) ←",
    "cats": {
      "work": "تعلیم / کام",
      "protection": "تحفظ",
      "health": "طبی علاج",
      "family": "خاندانی"
    },
    "soon": "جلد آ رہا ہے",
    "guides": [
      {
        "tag": "تحفظ",
        "color": "protection",
        "q": "بین الاقوامی تحفظ",
        "cta": "اٹلی میں پناہ کی درخواست کیسے دیں اور کارروائی کیسے ہوتی ہے",
        "href": "protezione-internazionale.html"
      },
      {
        "tag": "خاندانی",
        "color": "family",
        "q": "کیا میں اپنے خاندان کو لا سکتا ہوں؟",
        "cta": "اٹلی میں خاندانی اتحاد کی رہنمائی",
        "href": "ricongiungimento-familiare.html"
      },
      {
        "tag": "تعلیم / کام",
        "color": "work",
        "q": "Decreto flussi",
        "cta": "کام کے مقصد سے داخلے کا نظام کیسے کام کرتا ہے",
        "href": "decreto-flussi.html",
        "soon": true
      },
      {
        "color": "yellow",
        "q": "کون سی دستاویزات درکار ہیں؟",
        "cta": "جانیں کہ اپنے اجازت نامے کے لیے Questura میں کون سی دستاویزات لے کر جائیں",
        "href": "database.html?go=documenti",
        "tag": "کارروائیاں"
      },
      {
        "color": "yellow",
        "q": "Kit postale اور دیگر فارم",
        "href": "kit-postale.html",
        "tag": "کارروائیاں",
        "cta": "مرحلہ وار فارم"
      },
      {
        "color": "yellow",
        "q": "اجازت نامے کی لاگت کتنی ہے؟",
        "cta": "ہر قسم کے اجازت نامے کے لیے پوسٹل آرڈرز، ریونیو اسٹیمپ اور اخراجات",
        "href": "database.html?go=costi",
        "tag": "کارروائیاں"
      },
      {
        "color": "yellow",
        "q": "چیک کریں کہ آپ کا اجازت نامہ تیار ہے یا نہیں",
        "href": "controlla-permesso.html",
        "tag": "کارروائیاں",
        "cta": "حالت چیک کریں"
      }
    ],
    "legal": {
      "title": "مفت قانونی مدد",
      "desc": "آپ کے قریب مفت قانونی مدد فراہم کرنے والے دفاتر اور تنظیمیں →"
    },
    "dict": {
      "title": "لغت",
      "desc": "بیوروکریٹک اصطلاحات آسان زبان میں →"
    },
    "more": {
      "patto": "Patto UE",
      "label": "مزید جانیں:",
      "circolari": "سرکلرز",
      "normativa": "مربوط قوانین",
      "nuovo": "نیا"
    },
    "final": {
      "sub": "چند سوالات کے جواب دیں اور جانیں کہ آپ کیا کر سکتے ہیں۔",
      "noTitle": "میرے پاس اجازت نامہ نہیں ہے",
      "noAction": "کیا مجھے مل سکتا ہے؟ →",
      "haveTitle": "میرے پاس پہلے سے اجازت نامہ ہے",
      "haveAction": "کیا میں اس کی تجدید یا تبدیلی کر سکتا ہوں؟ →",
      "title": "معلوم نہیں کہاں سے شروع کریں؟"
    },
    "findTitle": "اپنا اجازت نامہ تلاش کریں",
    "guidesTitle": "مرحلہ وار رہنمائی",
    "_bozza": "Traduzioni di findTitle, guidesTitle, final.title, more.*, chip «Pratiche» e cta kit/controlla: BOZZA (ott 2026) da far rivedere a madrelingua."
  },
  "fa": {
    "badge": "+41 مجوز · به‌روزرسانی ۹ اکتبر ۲۰۲۶",
    "lead": "راهنمای مجوزهای اقامت.",
    "stamp": "آسان",
    "sub": "جامع. به‌روز. به چند سؤال پاسخ دهید و بدانید چه کاری می‌توانید انجام دهید.",
    "heroAlt": "افرادی که درباره مدارک مجوز اقامت اطلاعات کسب می‌کنند",
    "test": {
      "noEyebrow": "مجوز ندارم",
      "noQ": "آیا می‌توانم بگیرم؟",
      "haveEyebrow": "مجوز دارم",
      "haveQ": "آیا می‌توانم تمدید یا تبدیل کنم؟"
    },
    "seeAll": "همه مجوزها (پایگاه داده) ←",
    "cats": {
      "work": "تحصیل / کار",
      "protection": "حمایت",
      "health": "درمان پزشکی",
      "family": "دلایل خانوادگی"
    },
    "soon": "به‌زودی",
    "guides": [
      {
        "tag": "حمایت",
        "color": "protection",
        "q": "حمایت بین‌المللی",
        "cta": "چگونه در ایتالیا درخواست پناهندگی دهید و روند کار چگونه است",
        "href": "protezione-internazionale.html"
      },
      {
        "tag": "دلایل خانوادگی",
        "color": "family",
        "q": "آیا می‌توانم خانواده‌ام را بیاورم؟",
        "cta": "راهنمای الحاق خانواده در ایتالیا",
        "href": "ricongiungimento-familiare.html"
      },
      {
        "tag": "تحصیل / کار",
        "color": "work",
        "q": "Decreto flussi",
        "cta": "نحوه عملکرد سیستم ورود برای کار",
        "href": "decreto-flussi.html",
        "soon": true
      },
      {
        "color": "yellow",
        "q": "چه مدارکی لازم است؟",
        "cta": "بفهمید چه مدارکی باید به Questura برای مجوز خود ببرید",
        "href": "database.html?go=documenti",
        "tag": "امور اداری"
      },
      {
        "color": "yellow",
        "q": "Kit postale و فرم‌های دیگر",
        "href": "kit-postale.html",
        "tag": "امور اداری",
        "cta": "فرم‌ها گام‌به‌گام"
      },
      {
        "color": "yellow",
        "q": "هزینه مجوز چقدر است؟",
        "cta": "حواله‌های پستی، تمبرهای مالیاتی و هزینه‌ها برای هر نوع مجوز",
        "href": "database.html?go=costi",
        "tag": "امور اداری"
      },
      {
        "color": "yellow",
        "q": "بررسی کنید که آیا مجوز اقامت شما آماده است",
        "href": "controlla-permesso.html",
        "tag": "امور اداری",
        "cta": "وضعیت را بررسی کنید"
      }
    ],
    "legal": {
      "title": "کمک حقوقی رایگان",
      "desc": "دفاتر و سازمان‌هایی که کمک حقوقی رایگان در نزدیکی شما ارائه می‌دهند →"
    },
    "dict": {
      "title": "فرهنگ لغت",
      "desc": "اصطلاحات اداری به زبان ساده توضیح داده شده →"
    },
    "more": {
      "patto": "Patto UE",
      "label": "برای اطلاعات بیشتر:",
      "circolari": "بخشنامه‌ها",
      "normativa": "قوانین تلفیقی",
      "nuovo": "جدید"
    },
    "final": {
      "sub": "به چند سؤال پاسخ دهید و بدانید چه کاری می‌توانید انجام دهید.",
      "noTitle": "مجوز ندارم",
      "noAction": "آیا می‌توانم بگیرم؟ →",
      "haveTitle": "مجوز دارم",
      "haveAction": "آیا می‌توانم تمدید یا تبدیل کنم؟ →",
      "title": "نمی‌دانید از کجا شروع کنید؟"
    },
    "findTitle": "مجوز خود را پیدا کنید",
    "guidesTitle": "راهنماهای گام‌به‌گام",
    "_bozza": "Traduzioni di findTitle, guidesTitle, final.title, more.*, chip «Pratiche» e cta kit/controlla: BOZZA (ott 2026) da far rivedere a madrelingua."
  },
  "zh": {
    "badge": "41+ 种许可 · 2026年10月9日更新",
    "lead": "您的居留许可指南。",
    "stamp": "简单",
    "sub": "全面。最新。 回答几个问题，了解你能做什么。",
    "heroAlt": "人们正在查阅居留许可相关文件信息",
    "test": {
      "noEyebrow": "我没有居留许可",
      "noQ": "我能获得吗？",
      "haveEyebrow": "我已有居留许可",
      "haveQ": "我能续签或转换吗？"
    },
    "seeAll": "所有居留许可（数据库）→",
    "cats": {
      "work": "学习 / 工作",
      "protection": "保护",
      "health": "医疗",
      "family": "家庭"
    },
    "soon": "即将推出",
    "guides": [
      {
        "tag": "保护",
        "color": "protection",
        "q": "国际保护",
        "cta": "如何在意大利申请庇护以及程序如何运作",
        "href": "protezione-internazionale.html"
      },
      {
        "tag": "家庭",
        "color": "family",
        "q": "我能把家人带来吗？",
        "cta": "意大利家庭团聚指南",
        "href": "ricongiungimento-familiare.html"
      },
      {
        "tag": "学习 / 工作",
        "color": "work",
        "q": "Decreto flussi",
        "cta": "工作入境制度如何运作",
        "href": "decreto-flussi.html",
        "soon": true
      },
      {
        "color": "yellow",
        "q": "需要哪些文件？",
        "cta": "了解您需要带到Questura的文件",
        "href": "database.html?go=documenti",
        "tag": "办事手续"
      },
      {
        "color": "yellow",
        "q": "Kit postale 和其他表格",
        "href": "kit-postale.html",
        "tag": "办事手续",
        "cta": "分步填写表格"
      },
      {
        "color": "yellow",
        "q": "居留许可费用是多少？",
        "cta": "每种居留许可的汇款单、印花税和费用",
        "href": "database.html?go=costi",
        "tag": "办事手续"
      },
      {
        "color": "yellow",
        "q": "查看您的居留许可是否已准备好",
        "href": "controlla-permesso.html",
        "tag": "办事手续",
        "cta": "查询办理状态"
      }
    ],
    "legal": {
      "title": "免费法律援助",
      "desc": "在您附近提供免费法律援助的机构和组织 →"
    },
    "dict": {
      "title": "词典",
      "desc": "用简单语言解释的官僚术语 →"
    },
    "more": {
      "patto": "Patto UE",
      "label": "了解更多：",
      "circolari": "通告",
      "normativa": "综合法规",
      "nuovo": "新"
    },
    "final": {
      "sub": "回答几个问题，了解你能做什么。",
      "noTitle": "我没有居留许可",
      "noAction": "我能获得吗？ →",
      "haveTitle": "我已有居留许可",
      "haveAction": "我能续签或转换吗？ →",
      "title": "不知道从哪里开始？"
    },
    "findTitle": "查找您的居留许可",
    "guidesTitle": "分步指南",
    "_bozza": "Traduzioni di findTitle, guidesTitle, final.title, more.*, chip «Pratiche» e cta kit/controlla: BOZZA (ott 2026) da far rivedere a madrelingua."
  }
};
