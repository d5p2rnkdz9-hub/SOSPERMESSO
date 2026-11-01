// `search`: testi della ricerca nel menu (nav.liquid + src/scripts/search.js).
// {n} = numero di risultati, {q} = testo cercato. La voce `circolari` esiste
// solo in IT (le circolari sono in italiano). Fuori dall'IT è una BOZZA (_bozza).
module.exports = {
  it: {
    search: {"placeholder": "Cerca…", "label": "Cerca nel sito", "none": "Nessun risultato", "count": "{n} risultati", "types": {"permesso": "Permesso", "guida": "Guida", "dizionario": "Dizionario", "normativa": "Legge"}, "circolari": "Cerca «{q}» nelle circolari"},
    // Barra IT tutta a tasti semplici (nessuna tendina oltre alla lingua).
    // "Info" è stato tolto dalla barra: i suoi item (protezione,
    // ricongiungimento, lavoro, aiuto legale, dizionario) sono raggiungibili
    // dalla home; l'elenco dei permessi ha il tasto "Database".
    dropdowns: [
      {
        label: "Database",
        href: "/database.html",
        cta: "outline",
        items: []
      },
      {
        // Testi coordinati interattivi (bundle in public/patto-interattivo)
        // + circolari e prassi amministrativa: tutto raccolto in
        // /normativa.html, quindi niente tendina. Solo IT: contenuto
        // italiano non tradotto.
        label: "Leggi e circolari",
        href: "/normativa.html",
        cta: "outline",
        items: []
      },
      {
        label: "Patto UE",
        href: "https://www.sospatto.it",
        external: true,
        cta: "outline",
        badge: "NUOVO",
        badgeStyle: "blue",
        items: []
      },
      {
        label: "Contattaci",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  en: {
    search: {"placeholder": "Search…", "label": "Search the site", "none": "No results", "count": "{n} results", "types": {"permesso": "Permit", "guida": "Guide", "dizionario": "Dictionary", "normativa": "Law"}, "_bozza": "Traduzione BOZZA (nov 2026) da far rivedere a madrelingua."},
    dropdowns: [
      {
        label: "Info",
        href: "/en/#informazioni",
        items: [
          { label: "All permits", href: "/en/database.html" },
          { label: "International protection", href: "/en/protezione-internazionale.html" },
          { label: "Family reunification", href: "/en/ricongiungimento-familiare.html" },
          { label: "Legal aid", href: "/en/aiuto-legale.html" },
          { label: "Dictionary", href: "/en/dizionario.html" }
        ]
      },
      {
        label: "Contact us",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  fr: {
    search: {"placeholder": "Rechercher…", "label": "Rechercher sur le site", "none": "Aucun résultat", "count": "{n} résultats", "types": {"permesso": "Permis", "guida": "Guide", "dizionario": "Dictionnaire", "normativa": "Loi"}, "_bozza": "Traduzione BOZZA (nov 2026) da far rivedere a madrelingua."},
    dropdowns: [
      {
        label: "Info",
        href: "/fr/#informazioni",
        items: [
          { label: "Tous les permis", href: "/fr/database.html" },
          { label: "Protection internationale", href: "/fr/protezione-internazionale.html" },
          { label: "Regroupement familial", href: "/fr/ricongiungimento-familiare.html" },
          { label: "Aide juridique", href: "/fr/aiuto-legale.html" },
          { label: "Dictionnaire", href: "/fr/dizionario.html" }
        ]
      },
      {
        label: "Nous contacter",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  es: {
    search: {"placeholder": "Buscar…", "label": "Buscar en el sitio", "none": "Sin resultados", "count": "{n} resultados", "types": {"permesso": "Permiso", "guida": "Guía", "dizionario": "Diccionario", "normativa": "Ley"}, "_bozza": "Traduzione BOZZA (nov 2026) da far rivedere a madrelingua."},
    dropdowns: [
      {
        label: "Info",
        href: "/es/#informazioni",
        items: [
          { label: "Todos los permisos", href: "/es/database.html" },
          { label: "Protección internacional", href: "/es/protezione-internazionale.html" },
          { label: "Reunificación familiar", href: "/es/ricongiungimento-familiare.html" },
          { label: "Ayuda legal", href: "/es/aiuto-legale.html" },
          { label: "Diccionario", href: "/es/dizionario.html" }
        ]
      },
      {
        label: "Contáctanos",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  tr: {
    search: {"placeholder": "Ara…", "label": "Sitede ara", "none": "Sonuç bulunamadı", "count": "{n} sonuç", "types": {"permesso": "İzin", "guida": "Rehber", "dizionario": "Sözlük", "normativa": "Kanun"}, "_bozza": "Traduzione BOZZA (nov 2026) da far rivedere a madrelingua."},
    dropdowns: [
      {
        label: "Bilgi",
        href: "/tr/#informazioni",
        items: [
          { label: "Tüm izinler", href: "/tr/database.html" },
          { label: "Uluslararası koruma", href: "/tr/protezione-internazionale.html" },
          { label: "Aile birleşimi", href: "/tr/ricongiungimento-familiare.html" },
          { label: "Hukuki yardım", href: "/tr/aiuto-legale.html" },
          { label: "Sözlük", href: "/tr/dizionario.html" }
        ]
      },
      {
        label: "Bize ulaşın",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  ru: {
    search: {"placeholder": "Поиск…", "label": "Поиск по сайту", "none": "Ничего не найдено", "count": "Результатов: {n}", "types": {"permesso": "Разрешение", "guida": "Руководство", "dizionario": "Словарь", "normativa": "Закон"}, "_bozza": "Traduzione BOZZA (nov 2026) da far rivedere a madrelingua."},
    dropdowns: [
      {
        label: "Инфо",
        href: "/ru/#informazioni",
        items: [
          { label: "Все разрешения", href: "/ru/database.html" },
          { label: "Международная защита", href: "/ru/protezione-internazionale.html" },
          { label: "Воссоединение семьи", href: "/ru/ricongiungimento-familiare.html" },
          { label: "Юридическая помощь", href: "/ru/aiuto-legale.html" },
          { label: "Словарь", href: "/ru/dizionario.html" }
        ]
      },
      {
        label: "Связаться с нами",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  bn: {
    search: {"placeholder": "খুঁজুন…", "label": "সাইটে খুঁজুন", "none": "কোনো ফলাফল নেই", "count": "{n}টি ফলাফল", "types": {"permesso": "অনুমতি", "guida": "নির্দেশিকা", "dizionario": "অভিধান", "normativa": "আইন"}, "_bozza": "Traduzione BOZZA (nov 2026) da far rivedere a madrelingua."},
    dropdowns: [
      {
        label: "তথ্য",
        href: "/bn/#informazioni",
        items: [
          { label: "সব অনুমতি", href: "/bn/database.html" },
          { label: "আন্তর্জাতিক সুরক্ষা", href: "/bn/protezione-internazionale.html" },
          { label: "পারিবারিক পুনর্মিলন", href: "/bn/ricongiungimento-familiare.html" },
          { label: "আইনি সহায়তা", href: "/bn/aiuto-legale.html" },
          { label: "অভিধান", href: "/bn/dizionario.html" }
        ]
      },
      {
        label: "যোগাযোগ করুন",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  ar: {
    search: {"placeholder": "ابحث…", "label": "ابحث في الموقع", "none": "لا توجد نتائج", "count": "عدد النتائج: {n}", "types": {"permesso": "تصريح", "guida": "دليل", "dizionario": "قاموس", "normativa": "قانون"}, "_bozza": "Traduzione BOZZA (nov 2026) da far rivedere a madrelingua."},
    dropdowns: [
      {
        label: "معلومات",
        href: "/ar/#informazioni",
        items: [
          { label: "جميع التصاريح", href: "/ar/database.html" },
          { label: "الحماية الدولية", href: "/ar/protezione-internazionale.html" },
          { label: "لم شمل الأسرة", href: "/ar/ricongiungimento-familiare.html" },
          { label: "المساعدة القانونية", href: "/ar/aiuto-legale.html" },
          { label: "القاموس", href: "/ar/dizionario.html" }
        ]
      },
      {
        label: "اتصل بنا",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  ur: {
    search: {"placeholder": "تلاش کریں…", "label": "سائٹ میں تلاش کریں", "none": "کوئی نتیجہ نہیں ملا", "count": "{n} نتائج", "types": {"permesso": "اجازت نامہ", "guida": "رہنمائی", "dizionario": "لغت", "normativa": "قانون"}, "_bozza": "Traduzione BOZZA (nov 2026) da far rivedere a madrelingua."},
    dropdowns: [
      {
        label: "معلومات",
        href: "/ur/#informazioni",
        items: [
          { label: "تمام اجازت نامے", href: "/ur/database.html" },
          { label: "بین الاقوامی تحفظ", href: "/ur/protezione-internazionale.html" },
          { label: "خاندانی اتحاد", href: "/ur/ricongiungimento-familiare.html" },
          { label: "قانونی مدد", href: "/ur/aiuto-legale.html" },
          { label: "لغت", href: "/ur/dizionario.html" }
        ]
      },
      {
        label: "ہم سے رابطہ کریں",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  fa: {
    search: {"placeholder": "جستجو…", "label": "جستجو در سایت", "none": "نتیجه‌ای پیدا نشد", "count": "{n} نتیجه", "types": {"permesso": "مجوز", "guida": "راهنما", "dizionario": "واژه‌نامه", "normativa": "قانون"}, "_bozza": "Traduzione BOZZA (nov 2026) da far rivedere a madrelingua."},
    dropdowns: [
      {
        label: "اطلاعات",
        href: "/fa/#informazioni",
        items: [
          { label: "همه مجوزها", href: "/fa/database.html" },
          { label: "حمایت بین‌المللی", href: "/fa/protezione-internazionale.html" },
          { label: "پیوند خانوادگی", href: "/fa/ricongiungimento-familiare.html" },
          { label: "کمک حقوقی", href: "/fa/aiuto-legale.html" },
          { label: "واژه‌نامه", href: "/fa/dizionario.html" }
        ]
      },
      {
        label: "تماس با ما",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  },
  zh: {
    search: {"placeholder": "搜索…", "label": "搜索本站", "none": "没有结果", "count": "{n} 个结果", "types": {"permesso": "居留许可", "guida": "指南", "dizionario": "词典", "normativa": "法律"}, "_bozza": "Traduzione BOZZA (nov 2026) da far rivedere a madrelingua."},
    dropdowns: [
      {
        label: "信息",
        href: "/zh/#informazioni",
        items: [
          { label: "所有居留许可", href: "/zh/database.html" },
          { label: "国际保护", href: "/zh/protezione-internazionale.html" },
          { label: "家庭团聚", href: "/zh/ricongiungimento-familiare.html" },
          { label: "法律援助", href: "/zh/aiuto-legale.html" },
          { label: "词典", href: "/zh/dizionario.html" }
        ]
      },
      {
        label: "联系我们",
        href: "https://app.sospermesso.it/it/contattaci",
        external: true,
        cta: "outline",
        items: []
      }
    ]
  }
};
